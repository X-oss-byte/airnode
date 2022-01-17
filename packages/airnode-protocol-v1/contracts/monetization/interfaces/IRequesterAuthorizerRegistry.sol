// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../../utils/interfaces/IAddressRegistry.sol";

interface IRequesterAuthorizerRegistry is IAddressRegistry {
    event RegisteredRequesterAuthorizer(
        uint256 chainId,
        address requesterAuthorizer,
        address sender
    );

    function setChainRequesterAuthorizer(
        uint256 chainId,
        address requesterAuthorizer
    ) external;

    function tryReadChainRequesterAuthorizer(uint256 chainId)
        external
        view
        returns (bool success, address requesterAuthorizer);
}
