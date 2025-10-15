import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "@yd/ui";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    children: (
      <>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          這是一個來自 shadcn/ui 的 Alert，適合提示用戶需要關注的訊息。
        </AlertDescription>
      </>
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
