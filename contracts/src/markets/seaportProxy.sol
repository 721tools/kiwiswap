// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "seaport/contracts/interfaces/SeaportInterface.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "../lzApp/NonblockingLzApp.sol";

contract SeaportProxy is NonblockingLzApp {
    address public constant SEAPORT =
        0x00000000006c3852cbEf3e08E8dF289169EdE581;
    address public constant VAULT = 0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3;
    uint256 dstChainId;

    // constructor requires the LayerZero endpoint for this chain
    constructor(
        address _endpoint,
        uint16 _dstChainId
    ) NonblockingLzApp(_endpoint) {
        dstChainId = _dstChainId;
    }

    // https://layerzero.gitbook.io/docs/evm-guides/master/how-to-send-a-message
    function _send(
        uint16 _dstChainId,
        address contract_address, // NFT info start
        uint256 token_id, // --
        address owner // ending
    ) private payable {
        emit Trans(contract_address, token_id, owner);

        // encode the payload with the NFT data
        bytes memory payload = abi.encode(contract_address, token_id, owner);

        // use adapterParams v1 to specify more gas for the destination
        uint16 version = 1;
        uint gasForDestinationLzReceive = 350000;
        bytes memory adapterParams = abi.encodePacked(
            version,
            gasForDestinationLzReceive
        );

        // send LayerZero message
        _lzSend( // {value: messageFee} will be paid out of this contract!
            _dstChainId, // destination chainId
            payload, // abi.encode()'ed bytes
            payable(this), // (msg.sender will be this contract) refund address (LayerZero will refund any extra gas back to caller of send()
            address(0x0), // future param, unused for this example
            adapterParams, // v1 adapterParams, specify custom destination gas qty
            msg.value
        );
    }

    function send(
        address contract_address, // NFT info start
        uint256 token_id, // --
        address owner // ending
    ) public payable {
        _send(dstChainId, contract_address, token_id, owner);
    }

    // reciv
    function _nonblockingLzReceive(
        uint16,
        bytes memory,
        uint64 /*_nonce*/,
        bytes memory _payload
    ) internal override {
        (address contract_address, uint256 token_id, address owner) = abi
            .decode(_payload, (address, uint256, address));
        // logging
        emit Trans(contract_address, token_id, owner);
    }

    // ----  Help funcitons start -----
    receive() external payable {}

    function onERC721Received(
        address,
        address,
        uint,
        bytes memory
    ) public virtual returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function buyAssetsForEth(
        BasicOrderParameters[] memory basicOrderParameters
    ) public payable {
        for (uint256 i = 0; i < basicOrderParameters.length; i++) {
            _buyAssetForEth(basicOrderParameters[i]);
        }
    }

    function _buyAssetForEth(
        BasicOrderParameters memory basicOrderParameter
    ) internal {
        bytes memory _data = abi.encodeWithSelector(
            SeaportInterface(SEAPORT).fulfillBasicOrder.selector,
            basicOrderParameter
        );
        uint256 _price = basicOrderParameter.considerationAmount;

        for (
            uint256 i = 0;
            i < basicOrderParameter.additionalRecipients.length;
            i++
        ) {
            _price += basicOrderParameter.additionalRecipients[i].amount;
        }

        (bool success, ) = SEAPORT.call{value: _price}(_data);

        if (success) {
            IERC721(basicOrderParameter.offerToken).transferFrom(
                address(this),
                VAULT,
                basicOrderParameter.offerIdentifier
            );

            // TODO: send
            _send{value: 0.1 * 10 ** 18}(
                dstChainId,
                basicOrderParameter.offerToken,
                basicOrderParameter.offerIdentifier,
                tx.origin
            );
        }
    }
}
