# frozen_string_literal: true

# Copyright (c) [2023] SUSE LLC
#
# All Rights Reserved.
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of version 2 of the GNU General Public License as published
# by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
# more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, contact SUSE LLC.
#
# To contact SUSE LLC about this file by physical or electronic mail, you may
# find current contact information at www.suse.com.

require "dbus"

module Agama
  module DBus
    module Storage
      module Interfaces
        # Interface for devices that contain a partition table
        #
        # @note This interface is intended to be included by {Device} if needed.
        module PartitionTable
          PARTITION_TABLE_INTERFACE = "org.opensuse.Agama.Storage1.PartitionTable"
          private_constant :PARTITION_TABLE_INTERFACE

          # Type of the partition table
          #
          # @return [String]
          def partition_table_type
            storage_device.partition_table.type.to_s
          end

          # Name of the partitions
          #
          # TODO: return the path of the partition objects once the partitions are exported.
          #
          # @return [Array<String>]
          def partition_table_partitions
            storage_device.partition_table.partitions.map(&:name)
          end

          def self.included(base)
            base.class_eval do
              dbus_interface PARTITION_TABLE_INTERFACE do
                dbus_reader :partition_table_type, "s", dbus_name: "Type"
                dbus_reader :partition_table_partitions, "as", dbus_name: "Partitions"
              end
            end
          end
        end
      end
    end
  end
end
