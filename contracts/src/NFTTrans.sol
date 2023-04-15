// SPDX-License-Identifier: MIT

//
// Note:
// TransForm NFTs between L1   <->   L2
//                        |          |
//                        goerli     bsc-testnet

// NFT struct:
// {
//   contract_address: 0x1345,
//   token_id: 1111,
//   owner: 0x1234
// }

pragma solidity ^0.8.0;
pragma abicoder v2;

import "lzApp/NonblockingLzApp.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTTrans is NonblockingLzApp {
    // emit when send and reciv
    event Trans(address, uint256, address);

    // constructor requires the LayerZero endpoint for this chain
    constructor(address _endpoint) NonblockingLzApp(_endpoint) {}

    // https://layerzero.gitbook.io/docs/evm-guides/master/how-to-send-a-message
    function send(
        uint16 _dstChainId,
        address, // destination address of TransForm contract
        address contract_address, // NFT info start
        uint256 token_id, // --
        address owner // ending
    ) public payable {
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
}
