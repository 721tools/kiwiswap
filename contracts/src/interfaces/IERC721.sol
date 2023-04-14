import "@openzeppelin/contracts/interfaces/IERC721.sol";

interface IERC721Mintable is IERC721 {

    function mint(address recipient, uint id) external;

    function burn(uint256 tokenId) external;

}