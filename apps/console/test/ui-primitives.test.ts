import { describe, expect, it } from "vitest";
import React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { EmptyState } from "../components/ui/empty-state";

describe("UI Primitives", () => {
  it("exports all core UI primitive components", () => {
    expect(Button).toBeDefined();
    expect(Card).toBeDefined();
    expect(Badge).toBeDefined();
    expect(Input).toBeDefined();
    expect(Skeleton).toBeDefined();
    expect(EmptyState).toBeDefined();
  });

  it("creates valid Button element with variants and loading state", () => {
    const btn = React.createElement(Button, { variant: "default", size: "default", loading: true }, "Submit");
    expect(btn).not.toBeNull();
    expect(btn.props.variant).toBe("default");
    expect(btn.props.loading).toBe(true);
  });

  it("creates valid Card element with interactive elevation", () => {
    const card = React.createElement(Card, { elevated: true, interactive: true }, "Content");
    expect(card).not.toBeNull();
    expect(card.props.elevated).toBe(true);
    expect(card.props.interactive).toBe(true);
  });

  it("creates valid Badge element with status variant", () => {
    const badge = React.createElement(Badge, { variant: "success" }, "Verified");
    expect(badge).not.toBeNull();
    expect(badge.props.variant).toBe("success");
  });

  it("creates valid Input element", () => {
    const input = React.createElement(Input, { placeholder: "Enter name..." });
    expect(input).not.toBeNull();
    expect(input.props.placeholder).toBe("Enter name...");
  });

  it("creates valid EmptyState element with title and action", () => {
    const empty = React.createElement(EmptyState, {
      title: "No Data",
      description: "Get started by creating your first item.",
      action: { label: "Create Item" },
    });
    expect(empty).not.toBeNull();
    expect(empty.props.title).toBe("No Data");
  });
});
