/*
 * Copyright (c) [2022] SUSE LLC
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

import React from "react";
import { screen, within, waitFor } from "@testing-library/react";
import { installerRender } from "@/test-utils";
import Network from "@components/network/Network";
import { createClient } from "@client";

jest.mock("@client");
jest.mock("@components/network/NetworkWiredStatus", () => () => "Wired Connections");
jest.mock("@components/network/NetworkWifiStatus", () => () => "WiFi Connections");

let wirelessEnabled = false;
const networkSettings = { wireless: wirelessEnabled, hostname: "test" };

beforeEach(() => {
  createClient.mockImplementation(() => {
    return {
      network: {
        setUp: () => Promise.resolve(true),
        activeConnections: () => [],
        connections: () => Promise.resolve([]),
        accessPoints: () => [],
        onNetworkEvent: jest.fn(),
        settings: jest.fn().mockReturnValue(networkSettings)
      }
    };
  });
});

describe("Network", () => {
  describe("when it has not been initialized", () => {
    it("renders nothing", async () => {
      const { container } = installerRender(<Network />, { usingLayout: false });
      waitFor(() => expect(container).toBeEmptyDOMElement());
    });
  });

  describe("when it has been initialized", () => {
    it("renders nothing", async () => {
      const { container } = installerRender(<Network />, { usingLayout: false });
      waitFor(() => expect(container).toBeEmptyDOMElement());
    });

    it("renders a summary for wired and wifi connections", async () => {
      installerRender(<Network />);

      await screen.findByText("Wired Connections");
      await screen.findByText("WiFi Connections");
    });

    describe("when Wireless is currently not enabled", () => {
      it("does not show a link to open the WiFi selector", async () => {
        installerRender(<Network />);
        await screen.findByRole("button", { name: "Connect to a Wi-Fi network" });
      });
    });

    describe("when Wireless is currently enabled", () => {
      beforeEach(() => {
        wirelessEnabled = true;
      });

      it("shows a link to open the WiFi selector", async () => {
        installerRender(<Network />);
        await screen.findByRole("button", { name: "Connect to a Wi-Fi network" });
      });

      describe("when the user clicks on connect to a Wi-Fi", () => {
        it("opens the WiFi selector dialog", async () => {
          const { user } = installerRender(<Network />);
          const link = await screen.findByRole("button", { name: "Connect to a Wi-Fi network" });
          await user.click(link);
          const wifiDialog = await screen.findByRole("dialog");
          within(wifiDialog).getByText("Connect to a Wi-Fi network");
        });
      });
    });
  });
});
