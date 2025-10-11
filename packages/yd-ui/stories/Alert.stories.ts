import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    children: React.createElement(
      React.Fragment,
      null,
      React.createElement(AlertTitle, null, "Heads up!"),
      React.createElement(
        AlertDescription,
        null,
        "這是一個來自 shadcn/ui 的 Alert，適合提示用戶需要關注的訊息。",
      ),
    ),
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "destructive"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

