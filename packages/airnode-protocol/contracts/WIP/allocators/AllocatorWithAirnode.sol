// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./Allocator.sol";
import "./interfaces/IAllocatorWithAirnode.sol";

contract AllocatorWithAirnode is
    RoleDeriver,
    AccessControlRegistryUser,
    Allocator,
    IAllocatorWithAirnode
{
    /// @param _accessControlRegistry AccessControlRegistry contract address
    /// @param _adminRoleDescription Admin role description
    constructor(
        address _accessControlRegistry,
        string memory _adminRoleDescription
    ) Allocator(_accessControlRegistry, _adminRoleDescription) {}

    function setSlot(
        address airnode,
        uint256 slotIndex,
        bytes32 subscriptionId,
        uint64 expirationTimestamp
    ) external override {
        require(
            hasSlotSetterRoleOrIsAirnode(airnode, msg.sender),
            "Not slot setter"
        );
        _setSlot(airnode, slotIndex, subscriptionId, expirationTimestamp);
    }

    function slotIsVacatable(address airnode, uint256 slotIndex)
        public
        view
        override(Allocator, IAllocator)
        returns (bool)
    {
        Slot storage slot = airnodeToSlotIndexToSlot[airnode][slotIndex];
        return
            slot.expirationTimestamp < block.timestamp ||
            !hasSlotSetterRoleOrIsAirnode(airnode, slot.setter);
    }

    function hasSlotSetterRoleOrIsAirnode(address airnode, address account)
        public
        view
        override
        returns (bool)
    {
        return
            airnode == account ||
            IAccessControlRegistry(accessControlRegistry).hasRole(
                deriveSlotSetterRole(airnode),
                account
            );
    }

    function deriveSlotSetterRole(address airnode)
        public
        view
        override
        returns (bytes32 slotSetterRole)
    {
        slotSetterRole = _deriveRole(
            _deriveRole(_deriveRootRole(airnode), adminRoleDescriptionHash),
            SLOT_SETTER_ROLE_DESCRIPTION_HASH
        );
    }
}
