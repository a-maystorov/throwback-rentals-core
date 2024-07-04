import { describe, expect, it } from "vitest";
import { ICustomer, validateCustomer } from "../../src/models/customer";

describe("Customer Model", () => {
  it("should validate a valid customer", () => {
    const customer: ICustomer = {
      name: "John Doe",
      isGold: true,
      phone: "123456",
    };

    const { error } = validateCustomer(customer);

    expect(error).toBeUndefined();
  });

  it("should return an error if name is less than 6 characters", () => {
    const customer: ICustomer = {
      name: "John",
      isGold: false,
      phone: "123456",
    };

    const { error } = validateCustomer(customer);

    expect(error).toBeDefined();
  });

  it("should return an error if name is more than 20 characters", () => {
    const customer: ICustomer = {
      name: "John Doe".repeat(4),
      isGold: true,
      phone: "123456",
    };

    const { error } = validateCustomer(customer);

    expect(error).toBeDefined();
  });

  it("should return an error if phone number is less than 6 characters", () => {
    const customer: ICustomer = {
      name: "John Doe",
      isGold: false,
      phone: "12345",
    };

    const { error } = validateCustomer(customer);

    expect(error).toBeDefined();
  });

  it("should return an error if phone number is more than 20 characters", () => {
    const customer: ICustomer = {
      name: "John Doe",
      isGold: true,
      phone: "123456".repeat(4),
    };

    const { error } = validateCustomer(customer);

    expect(error).toBeDefined();
  });
});
