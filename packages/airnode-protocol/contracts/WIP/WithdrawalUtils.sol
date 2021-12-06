// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./interfaces/IWithdrawalUtils.sol";

contract WithdrawalUtils is IWithdrawalUtils {
    mapping(address => uint256) public sponsorToWithdrawalRequestCount;

    mapping(bytes32 => bytes32) private withdrawalRequestIdToParameters;

    function requestWithdrawal(
        address reporter,
        uint256 protocolId,
        address sponsorWallet
    ) external {
        bytes32 withdrawalRequestId = keccak256(
            abi.encodePacked(
                block.chainid,
                address(this),
                msg.sender,
                ++sponsorToWithdrawalRequestCount[msg.sender]
            )
        );
        withdrawalRequestIdToParameters[withdrawalRequestId] = keccak256(
            abi.encodePacked(reporter, msg.sender, protocolId, sponsorWallet)
        );
        emit RequestedWithdrawal(
            reporter,
            msg.sender,
            withdrawalRequestId,
            protocolId,
            sponsorWallet
        );
    }

    function fulfillWithdrawal(
        bytes32 withdrawalRequestId,
        address reporter,
        address sponsor,
        uint256 protocolId
    ) external payable {
        require(
            withdrawalRequestIdToParameters[withdrawalRequestId] ==
                keccak256(
                    abi.encodePacked(reporter, sponsor, protocolId, msg.sender)
                ),
            "Invalid withdrawal fulfillment"
        );
        delete withdrawalRequestIdToParameters[withdrawalRequestId];
        emit FulfilledWithdrawal(
            reporter,
            sponsor,
            withdrawalRequestId,
            protocolId,
            msg.sender,
            msg.value
        );
        (bool success, ) = sponsor.call{value: msg.value}(""); // solhint-disable-line avoid-low-level-calls
        require(success, "Transfer failed");
    }
}