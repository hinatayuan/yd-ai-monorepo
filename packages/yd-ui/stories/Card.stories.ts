import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () =>
    React.createElement(
      Card,
      { className: "w-[380px]" },
      React.createElement(
        CardHeader,
        null,
        React.createElement(CardTitle, null, "shadcn/ui"),
        React.createElement(
          CardDescription,
          null,
          "復用 Tailwind 組件的最佳起點。",
        ),
      ),
      React.createElement(
        CardContent,
        { className: "grid gap-4" },
        React.createElement(
          "div",
          null,
          React.createElement(
            "p",
            { className: "text-sm text-muted-foreground" },
            "這個示例展示了 Card header、content 與 footer 的基本排版。",
          ),
        ),
      ),
      React.createElement(
        CardFooter,
        { className: "flex justify-end" },
        React.createElement(
          "button",
          {
            className:
              "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow",
          },
          "了解更多",
        ),
      ),
    ),
};

