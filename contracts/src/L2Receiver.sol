// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "seaport/contracts/interfaces/SeaportInterface.sol";
import "interfaces/IERC721.sol";

contract L2Receiver {
    address public constant SENDER = 0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3;
    address public constant L2BAYC = 0xDeB7540Ae5d0F724a8f0ab6cac49F73a3DebA2f3;

    function receiver(address fromAddress, address l1ContractAddress, uint256 l1TokenId, address destAddress) public {
        //TODO:
        require(SENDER == fromAddress, "sender must be L1 sender");

        //only support bayc for now
        require(l1ContractAddress == L2BAYC, "only support bayc for now");
        IERC721Mintable(L2BAYC).mint(destAddress, l1TokenId);
    }

    // function sender(uint256 l1TokenId) public {

    //     IERC721Mintable(L2BAYC).safeTransferFrom(msg.sender, balance(this), l1TokenId);
    //     IERC721Mintable(L2BAYC).burn(l1TokenId);

    //     //send
    // }

}
