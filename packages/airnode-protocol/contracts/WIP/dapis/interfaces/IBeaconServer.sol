// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../../interfaces/IAirnodeRequester.sol";

interface IBeaconServer is IAirnodeRequester {
    event SetUpdatePermissionStatus(
        address indexed sponsor,
        address indexed updateRequester,
        bool status
    );

    event UpdatedBeaconWithoutRequest(
        bytes32 indexed beaconId,
        int256 value,
        uint256 timestamp
    );

    event RequestedBeaconUpdate(
        bytes32 indexed beaconId,
        address indexed sponsor,
        address indexed requester,
        bytes32 requestId,
        bytes32 templateId,
        bytes parameters
    );

    event RequestedBeaconUpdateRelayed(
        bytes32 indexed beaconId,
        address indexed sponsor,
        address indexed requester,
        bytes32 requestId,
        address relayer,
        bytes32 templateId,
        bytes parameters
    );

    event UpdatedBeaconWithRrp(
        bytes32 indexed beaconId,
        bytes32 requestId,
        int224 value,
        uint32 timestamp
    );

    event UpdatedBeaconWithPsp(
        bytes32 indexed beaconId,
        bytes32 subscriptionId,
        int224 value,
        uint32 timestamp
    );

    function setUpdatePermissionStatus(address updateRequester, bool status)
        external;

    function updateBeaconWithoutRequest(
        bytes32 templateId,
        bytes calldata parameters,
        uint256 timestamp,
        bytes calldata data,
        bytes calldata signature
    ) external;

    function requestBeaconUpdate(
        bytes32 templateId,
        address sponsor,
        bytes calldata parameters
    ) external;

    function requestBeaconUpdate(
        bytes32 templateId,
        address relayer,
        address sponsor,
        bytes calldata parameters
    ) external;

    function fulfillRrp(
        bytes32 requestId,
        uint256 timestamp,
        bytes calldata data
    ) external;

    function fulfillPsp(
        bytes32 subscriptionId,
        uint256 timestamp,
        bytes calldata data
    ) external;

    function readBeacon(bytes32 beaconId)
        external
        view
        returns (int224 value, uint32 timestamp);

    function readerCanReadBeacon(bytes32 beaconId, address reader)
        external
        view
        returns (bool);

    function beaconIdToReaderToWhitelistStatus(bytes32 beaconId, address reader)
        external
        view
        returns (uint64 expirationTimestamp, uint192 indefiniteWhitelistCount);

    function beaconIdToReaderToSetterToIndefiniteWhitelistStatus(
        bytes32 beaconId,
        address reader,
        address setter
    ) external view returns (bool indefiniteWhitelistStatus);

    function deriveBeaconId(bytes32 templateId, bytes memory parameters)
        external
        pure
        returns (bytes32 beaconId);

    // solhint-disable-next-line func-name-mixedcase
    function UNLIMITED_READER_ROLE_DESCRIPTION()
        external
        view
        returns (string memory);

    function unlimitedReaderRole() external view returns (bytes32);

    function sponsorToUpdateRequesterToPermissionStatus(
        address sponsor,
        address updateRequester
    ) external view returns (bool permissionStatus);
}
