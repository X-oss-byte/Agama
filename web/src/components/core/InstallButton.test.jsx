/*
 * Copyright (c) [2022-2023] SUSE LLC
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
import { screen, waitFor } from "@testing-library/react";
import { installerRender } from "~/test-utils";
import { createClient } from "~/client";
import { InstallButton } from "~/components/core";

const startInstallationFn = jest.fn().mockName("startInstallation");

jest.mock("~/client", () => ({
  createClient: jest.fn()
}));

describe("when the button is clicked and there are not errors", () => {
  let hasIssues = false;

  beforeEach(() => {
    createClient.mockImplementation(() => {
      return {
        manager: {
          startInstallation: startInstallationFn,
          canInstall: () => Promise.resolve(true),
        },
        issues: {
          any: () => Promise.resolve(hasIssues)
        }
      };
    });
  });

  it("starts the installation after user confirmation", async () => {
    const { user } = installerRender(<InstallButton />);
    const button = await screen.findByRole("button", { name: "Install" });
    await user.click(button);

    const continueButton = await screen.findByRole("button", { name: "Continue" });
    await user.click(continueButton);
    expect(startInstallationFn).toHaveBeenCalled();
  });

  it("does not start the installation if the user cancels", async () => {
    const { user } = installerRender(<InstallButton />);
    const button = await screen.findByRole("button", { name: "Install" });
    await user.click(button);

    const cancelButton = await screen.findByRole("button", { name: "Cancel" });
    await user.click(cancelButton);
    expect(startInstallationFn).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    });
  });

  describe("if there are issues", () => {
    beforeEach(() => {
      hasIssues = true;
    });

    it("shows a link to go to the issues page", async () => {
      const { user } = installerRender(<InstallButton />);
      const button = await screen.findByRole("button", { name: "Install" });
      await user.click(button);

      await screen.findByRole("button", { name: /list of issues$/ });
    });
  });

  describe("if there are not issues", () => {
    beforeEach(() => {
      hasIssues = false;
    });

    it("does not show a link to go to the issues page", async () => {
      const { user } = installerRender(<InstallButton />);
      const button = await screen.findByRole("button", { name: "Install" });
      await user.click(button);
      await waitFor(() => {
        const link = screen.queryByRole("button", { name: /list of issues$/ });
        expect(link).toBeNull();
      });
    });
  });
});
