import { describe, expect, it } from "vitest";
import { IGenre, validateGenre } from "../../src/models/genre";

describe("Genre Model", () => {
  it("should validate a valid genre", () => {
    const genre: IGenre = { name: "ABC" };
    const { error } = validateGenre(genre);
    expect(error).toBeUndefined();
  });

  it("should return an error if genre is less than 3 characters", () => {
    const genre = { name: "AB" };
    const { error } = validateGenre(genre);
    expect(error).toBeDefined();
  });

  it("should return an error if genre is more than 50 characters", () => {
    const genre = { name: "A".repeat(51) };
    const { error } = validateGenre(genre);
    expect(error).toBeDefined();
  });
});
