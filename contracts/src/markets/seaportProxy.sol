// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "seaport/contracts/interfaces/SeaportInterface.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

contract SeaportProxy {
    address public constant SEAPORT = 0x00000000006c3852cbEf3e08E8dF289169EdE581;

    function buyAssetsForEth(BasicOrderParameters[] memory basicOrderParameters) public payable {
        for (uint256 i = 0; i < basicOrderParameters.length; i++) {
            _buyAssetForEth(basicOrderParameters[i]);
        }
    }

    function _buyAssetForEth(BasicOrderParameters memory basicOrderParameter) internal {
        bytes memory _data = abi.encodeWithSelector(
            SeaportInterface(SEAPORT).fulfillBasicOrder.selector,
            basicOrderParameter
        );
        uint256 _price = basicOrderParameter.considerationAmount;

        for (uint256 i = 0; i < basicOrderParameter.additionalRecipients.length; i++) {
            _price += basicOrderParameter.additionalRecipients[i].amount;
        }

        (bool success, ) = SEAPORT.call{value: _price}(_data);

        if (success) {
            // TODO:
            IERC721(basicOrderParameter.offerToken).transferFrom(
                address(this),
                msg.sender,
                basicOrderParameter.offerIdentifier
            );
        }
    }
}
