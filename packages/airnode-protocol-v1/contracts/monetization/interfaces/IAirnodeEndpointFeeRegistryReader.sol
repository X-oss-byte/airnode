// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IAirnodeEndpointFeeRegistry {
    function getPrice(
        address airnode,
        uint256 chainId,
        bytes32 endpointId
    ) external view returns (uint256 price);

    // solhint-disable-next-line func-name-mixedcase
    function DENOMINATION() external view returns (string memory);

    // solhint-disable-next-line func-name-mixedcase
    function DECIMALS() external view returns (uint256);

    // solhint-disable-next-line func-name-mixedcase
    function PRICING_INTERVAL() external view returns (uint256);
}

interface IAirnodeEndpointFeeRegistryReader {
    function airnodeEndpointFeeRegistry() external view returns (address);
}
