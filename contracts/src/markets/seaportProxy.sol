// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "seaport/contracts/interfaces/SeaportInterface.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";

contract SeaportProxy {
    address public constant SEAPORT = 0x00000000006c3852cbEf3e08E8dF289169EdE581;
    address public constant VAULT = 0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3;

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
                VAULT,
                basicOrderParameter.offerIdentifier
            );
        }
    }
}
