/*
 * Copyright (c) [2023] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import React, { useState } from "react";
import { sprintf } from "sprintf-js";

import { _ } from "~/i18n";
import { noop } from "~/utils";
import { Icon } from "~/components/layout";
import { If } from "~/components/core";
import { deviceSize } from "~/components/storage/utils";

/**
 * @typedef {import ("~/clients/storage").StorageDevice} StorageDevice
 */

const ListBox = ({ children, ...props }) => <ul role="listbox" {...props}>{children}</ul>;

const ListBoxItem = ({ isSelected, children, onClick }) => {
  const props = {};
  if (isSelected) props['aria-selected'] = true;

  return (
    <li
      role="option"
      onClick={onClick}
      { ...props }
    >
      {children}
    </li>
  );
};

/**
 * Content for a device item
 * @component
 *
 * @param {Object} props
 * @param {StorageDevice} props.device
 */
const ItemContent = ({ device }) => {
  const BasicInfo = () => {
    const DeviceIcon = () => {
      const names = {
        raid: "storage",
        md: "storage"
      };

      const name = names[device.type] || "hard_drive";

      return <Icon name={name} />;
    };

    const DeviceSize = () => {
      if (device.size === undefined) return null;

      return <div>{deviceSize(device.size)}</div>;
    };

    return (
      <div>
        <DeviceIcon />
        <DeviceSize />
      </div>
    );
  };

  const ExtendedInfo = () => {
    const DeviceName = () => {
      if (device.name === undefined) return null;

      return <div>{device.name}</div>;
    };

    const DeviceType = () => {
      let type;

      switch (device.type) {
        case "multipath": {
          // TRANSLATORS: multipath device type
          type = _("Multipath");
          break;
        }
        case "dasd": {
          // TRANSLATORS: %s is replaced by the device bus ID
          type = sprintf(_("DASD %s"), device.busId);
          break;
        }
        case "md": {
          // TRANSLATORS: software RAID device, %s is replaced by the RAID level, e.g. RAID-1
          type = sprintf(_("Software %s"), device.level.toUpperCase());
          break;
        }
        case "disk": {
          type = device.sdCard
            ? _("SD Card")
            // TRANSLATORS: %s is replaced by the device transport name, e.g. USB, SATA, SCSI...
            : sprintf(_("Transport %s"), device.transport);
        }
      }

      return <If condition={type} then={<div>{type}</div>} />;
    };

    const DeviceModel = () => {
      if (!device.model || device.model === "") return null;

      return <div>{device.model}</div>;
    };

    const MDInfo = () => {
      if (device.type !== "md") return null;

      const members = device.members.map(m => m.split("/").at(-1));

      // TRANSLATORS: RAID details, %s is replaced by list of devices used by the array
      return <div>{sprintf(_("Members: %s"), members.sort().join(", "))}</div>;
    };

    const RAIDInfo = () => {
      if (device.type !== "raid") return null;

      const devices = device.devices.map(m => m.split("/").at(-1));

      // TRANSLATORS: RAID details, %s is replaced by list of devices used by the array
      return <div>{sprintf(_("Devices: %s"), devices.sort().join(", "))}</div>;
    };

    const MultipathInfo = () => {
      if (device.type !== "multipath") return null;

      const wires = device.wires.map(m => m.split("/").at(-1));

      // TRANSLATORS: multipath details, %s is replaced by list of connections used by the device
      return <div>{sprintf(_("Wires: %s"), wires.sort().join(", "))}</div>;
    };

    return (
      <div>
        <DeviceName />
        <DeviceType />
        <DeviceModel />
        <MDInfo />
        <RAIDInfo />
        <MultipathInfo />
      </div>
    );
  };

  const ContentInfo = () => {
    const PTable = () => {
      if (device.partitionTable === undefined) return null;

      const type = device.partitionTable.type.toUpperCase();
      const numPartitions = device.partitionTable.partitions.length;

      // TRANSLATORS: disk partition info, %s is replaced by partition table
      // type (MS-DOS or GPT), %d is the number of the partitions
      const text = sprintf(_("%s with %d partitions"), type, numPartitions);

      return (
        <div>
          <Icon name="folder" size="14" /> {text}
        </div>
      );
    };

    const Systems = () => {
      if (device.systems.length === 0) return null;

      const System = ({ system }) => {
        const logo = /windows/i.test(system) ? "windows_logo" : "linux_logo";

        return <div><Icon name={logo} size="14" /> {system}</div>;
      };

      return device.systems.map((s, i) => <System key={i} system={s} />);
    };

    const NotFound = () => {
      // TRANSLATORS: status message, no existing content was found on the disk,
      // i.e. the disk is completely empty
      return <div><Icon name="folder_off" size="14" /> {_("No content found")}</div>;
    };

    const hasContent = device.partitionTable || device.systems.length > 0;

    return (
      <div>
        <If
          condition={hasContent}
          then={<><PTable /><Systems /></>}
          else={<NotFound />}
        />
      </div>
    );
  };

  return (
    <>
      <BasicInfo />
      <ExtendedInfo />
      <ContentInfo />
    </>
  );
};

/**
 * Component for selecting a storage device
 * @component
 *
 * @param {Object} props
 * @param {StorageDevice} [props.selected] - Default selected device, in any
 * @param {StorageDevice[]=[]} [props.devices] - Devices to show in the selector
 * @param {onSelectFn} [props.onSelect] - Function to be called when a device is selected
 *
 * @callback onSelectFn
 * @param {StorageDevice} device - Selected device
 */
export default function DeviceSelector ({ selected, devices = [], onSelect = noop }) {
  const [selectedDevice, setSelectedDevice] = useState(selected);

  const onOptionClick = (device) => {
    if (device === selectedDevice) return;

    setSelectedDevice(device);
    onSelect(device);
  };

  return (
    <ListBox aria-label={_("Available devices")} className="stack device-selector">
      { devices.map(device => (
        <ListBoxItem
          key={device.sid}
          onClick={() => onOptionClick(device)}
          isSelected={device === selectedDevice}
        >
          <ItemContent device={device} />
        </ListBoxItem>
      ))}
    </ListBox>
  );
}
