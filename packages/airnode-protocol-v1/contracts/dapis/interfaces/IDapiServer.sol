// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "../../interfaces/IAirnodeRequester.sol";

interface IDapiServer is IAirnodeRequester {
    event SetUpdatePermissionStatus(
        address indexed sponsor,
        address indexed updateRequester,
        bool status
    );

    event RequestedRrpBeaconUpdate(
        bytes32 indexed beaconId,
        address indexed sponsor,
        address indexed requester,
        bytes32 requestId,
        bytes32 templateId,
        bytes parameters
    );

    event RequestedRrpBeaconUpdateRelayed(
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

    event RegisteredSubscription(
        bytes32 indexed subscriptionId,
        bytes32 beaconId
    );

    event UpdatedBeaconWithPsp(
        bytes32 indexed beaconId,
        bytes32 subscriptionId,
        int224 value,
        uint32 timestamp
    );

    event UpdatedBeaconWithSignedData(
        bytes32 indexed beaconId,
        int256 value,
        uint256 timestamp
    );

    event UpdatedDapi(bytes32 indexed dapiId, int224 value, uint32 timestamp);

    event UpdatedDapiWithSignedData(
        bytes32 indexed dapiId,
        int224 value,
        uint32 timestamp
    );

    event SetName(bytes32 name, bytes32 dataPointId, address sender);

    function setUpdatePermissionStatus(address updateRequester, bool status)
        external;

    function requestRrpBeaconUpdate(
        bytes32 templateId,
        bytes calldata parameters,
        address sponsor
    ) external;

    function requestRrpBeaconUpdateRelayed(
        bytes32 templateId,
        bytes calldata parameters,
        address relayer,
        address sponsor
    ) external;

    function fulfillRrpBeaconUpdate(
        bytes32 requestId,
        uint256 timestamp,
        bytes calldata data
    ) external;

    function registerBeaconUpdateSubscription(
        bytes32 templateId,
        bytes calldata parameters,
        bytes calldata conditions,
        address relayer,
        address sponsor
    ) external returns (bytes32 subscriptionId, bytes32 beaconId);

    function conditionPspBeaconUpdate(
        bytes32 subscriptionId,
        bytes calldata data,
        bytes calldata conditionParameters
    ) external returns (bool);

    function fulfillPspBeaconUpdate(
        bytes32 subscriptionId,
        uint256 timestamp,
        bytes calldata data
    ) external;

    function updateBeaconWithSignedData(
        bytes32 templateId,
        bytes calldata parameters,
        uint256 timestamp,
        bytes calldata data,
        bytes calldata signature
    ) external;

    function updateDapi(bytes32[] memory beaconIds)
        external
        returns (bytes32 dapiId);

    function conditionPspDapiUpdate(
        bytes32 subscriptionId, // solhint-disable-line no-unused-vars
        bytes calldata data,
        bytes calldata conditionParameters
    ) external returns (bool);

    function fulfillPspDapiUpdate(
        bytes32 subscriptionId, // solhint-disable-line no-unused-vars
        uint256 timestamp,
        bytes calldata data
    ) external;

    function updateDapiWithSignedData(
        bytes32[] calldata templateIds,
        bytes[] calldata parameters,
        uint256[] calldata timestamps,
        bytes[] calldata data,
        bytes[] calldata signatures
    ) external returns (bytes32 dapiId);

    function setName(bytes32 name, bytes32 dataPointId) external;

    function readWithDataPointId(bytes32 dataPointId)
        external
        view
        returns (int224 value, uint32 timestamp);

    function readWithName(bytes32 name)
        external
        view
        returns (int224 value, uint32 timestamp);

    function readerCanReadDataPoint(bytes32 dataPointId, address reader)
        external
        view
        returns (bool);

    function dataPointIdToReaderToWhitelistStatus(
        bytes32 dataPointId,
        address reader
    )
        external
        view
        returns (uint64 expirationTimestamp, uint192 indefiniteWhitelistCount);

    function dataPointIdToReaderToSetterToIndefiniteWhitelistStatus(
        bytes32 dataPointId,
        address reader,
        address setter
    ) external view returns (bool indefiniteWhitelistStatus);

    function deriveBeaconId(bytes32 templateId, bytes memory parameters)
        external
        pure
        returns (bytes32 beaconId);

    function deriveDapiId(bytes32[] memory beaconIds)
        external
        pure
        returns (bytes32 dapiId);

    // solhint-disable-next-line func-name-mixedcase
    function UNLIMITED_READER_ROLE_DESCRIPTION()
        external
        view
        returns (string memory);

    // solhint-disable-next-line func-name-mixedcase
    function NAME_SETTER_ROLE_DESCRIPTION()
        external
        view
        returns (string memory);

    // solhint-disable-next-line func-name-mixedcase
    function HUNDRED_PERCENT() external view returns (uint256);

    function unlimitedReaderRole() external view returns (bytes32);

    function nameSetterRole() external view returns (bytes32);

    function sponsorToUpdateRequesterToPermissionStatus(
        address sponsor,
        address updateRequester
    ) external view returns (bool);

    function subscriptionIdToBeaconId(bytes32 subscriptionId)
        external
        view
        returns (bytes32);

    function nameToDataPointId(bytes32 name) external view returns (bytes32);
}