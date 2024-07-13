import request from "supertest";
import { Genre, IGenre } from "../../src/models/genre";
import { User } from "../../src/models/user";
import { Game, IGame } from "../../src/models/game";
import { Types } from "mongoose";
import { beforeEach, afterEach, it, expect, describe } from "vitest";
import { server } from "../../src/server";

describe("/api/games", () => {
  afterEach(async () => {
    await Game.deleteMany({});
    await Genre.deleteMany({});
    server.close();
  });

  describe("GET /", () => {
    it("should return all games", async () => {
      const genre1 = new Genre({ name: "genre1" });
      const genre2 = new Genre({ name: "genre2" });

      await genre1.save();
      await genre2.save();

      const games: IGame[] = [
        {
          title: "game1",
          genre: genre1._id,
          numberInStock: 1,
          dailyRentalRate: 2,
          purchasePrice: 39.99,
        },
        {
          title: "game2",
          genre: genre2._id,
          numberInStock: 3,
          dailyRentalRate: 4,
          purchasePrice: 59.99,
        },
      ];

      await Game.collection.insertMany(games);

      const res = await request(server).get("/api/games");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g: IGame) => g.title === "game1")).toBeTruthy();
      expect(res.body.some((g: IGame) => (g.genre as IGenre).name === genre2.name)).toBeTruthy();
      expect(res.body.some((g: IGame) => g.numberInStock === 1)).toBeTruthy();
      expect(res.body.some((g: IGame) => g.dailyRentalRate === 4)).toBeTruthy();
      expect(res.body.some((g: IGame) => g.purchasePrice === 39.99)).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let token: string;

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return 401 if user is not logged in", async () => {
      const genre1 = new Genre({ name: "genre1" });
      await genre1.save();

      const game = new Game({
        title: "game1",
        genre: genre1._id,
        numberInStock: 1,
        dailyRentalRate: 2,
        purchasePrice: 59.99,
      });

      await game.save();

      token = "";

      const res = await request(server)
        .get("/api/games/" + game._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(401);
    });

    it("should return a game if valid id is passed", async () => {
      const genre1 = new Genre({ name: "genre1" });
      await genre1.save();

      const game = new Game({
        title: "game1",
        genre: genre1._id,
        numberInStock: 1,
        dailyRentalRate: 2,
        purchasePrice: 59.99,
      });

      await game.save();

      const res = await request(server)
        .get("/api/games/" + game._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "game1");
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre).toHaveProperty("name", "genre1");
      expect(res.body).toHaveProperty("numberInStock", 1);
      expect(res.body).toHaveProperty("dailyRentalRate", 2);
      expect(res.body).toHaveProperty("purchasePrice", 59.99);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/games/1").set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 404 if no game with the given id exists", async () => {
      const id = new Types.ObjectId();

      const res = await request(server)
        .get("/api/games/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token: string;
    let title: string;
    let genreId: string;
    let numberInStock: number;
    let dailyRentalRate: number;
    let purchasePrice: number;

    const exe = async () => {
      return await request(server)
        .post("/api/games")
        .set("x-auth-token", token)
        .send({ title, genre: genreId, numberInStock, dailyRentalRate, purchasePrice });
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();
      title = "game1";
      genreId = new Types.ObjectId().toHexString();
      numberInStock = 1;
      dailyRentalRate = 1;
      purchasePrice = 59.99;

      const genre = new Genre({ _id: genreId, name: "genre1" });
      await genre.save();
    });

    it("should return 401 if user is not loggend in", async () => {
      token = "";

      const res = await exe();

      expect(res.status).toBe(401);
    });

    it("should return 400 if title is less than 3 characters", async () => {
      title = "ab";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if title is more than 50 characters", async () => {
      title = "a".repeat(51);

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genreId is not provided", async () => {
      genreId = "";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if invalid genreId is provided", async () => {
      genreId = "1";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is less than 0", async () => {
      numberInStock = -1;

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is less than 0", async () => {
      dailyRentalRate = -1;

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if purchasePrice is less than 0", async () => {
      purchasePrice = -1;

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should save the game if it is valid", async () => {
      await exe();

      const game = await Game.find({ name: "game1" });

      expect(game).not.toBeNull();
    });

    it("should return the game if it is valid", async () => {
      const res = await exe();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "game1");
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre).toHaveProperty("name", "genre1");
      expect(res.body).toHaveProperty("numberInStock", 1);
      expect(res.body).toHaveProperty("dailyRentalRate", 1);
      expect(res.body).toHaveProperty("purchasePrice", 59.99);
    });
  });

  describe("PUT /:id", () => {
    let token: string;
    let game: InstanceType<typeof Game>;
    let newTitle: string;
    let newGenreId: string;
    let newGenre: InstanceType<typeof Genre>;
    let newNumberInStock: number;
    let newDailyRentalRate: number;
    let newPurchasePrice: number;
    let id: Types.ObjectId | string;

    const exe = async () => {
      return await request(server)
        .put("/api/games/" + id)
        .set("x-auth-token", token)
        .send({
          title: newTitle,
          genre: newGenreId,
          numberInStock: newNumberInStock,
          dailyRentalRate: newDailyRentalRate,
          purchasePrice: newPurchasePrice,
        });
    };

    beforeEach(async () => {
      const genreId = new Types.ObjectId();
      const genre = new Genre({ _id: genreId, name: "genre1" });
      await genre.save();

      game = new Game({
        title: "game1",
        genre,
        numberInStock: 1,
        dailyRentalRate: 1,
        purchasePrice: 59.99,
      });

      await game.save();

      const updatedGenreId = new Types.ObjectId().toHexString();
      const updatedGenre = new Genre({ _id: updatedGenreId, name: "genre2" });
      await updatedGenre.save();

      token = new User().generateAuthToken();
      id = game._id;
      newTitle = "updatedTitle";
      newGenreId = updatedGenreId;
      newGenre = updatedGenre;
      newNumberInStock = 2;
      newDailyRentalRate = 2;
      newPurchasePrice = 49.99;
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exe();

      expect(res.status).toBe(401);
    });

    it("should return 400 if title is less than 3 characters", async () => {
      newTitle = "ab";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if title is more than 50 characters", async () => {
      newTitle = "a".repeat(51);

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genreId is not provided", async () => {
      newGenreId = "";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genreId is invalid", async () => {
      newGenreId = "1";

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is less than 0", async () => {
      newNumberInStock = -1;

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is less than 0", async () => {
      newDailyRentalRate = -1;

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 400 if purchasePrice is less than 0", async () => {
      newPurchasePrice = -1;

      const res = await exe();

      expect(res.status).toBe(400);
    });

    it("should return 404 if game id is invalid", async () => {
      id = "1";

      const res = await exe();

      expect(res.status).toBe(404);
    });

    it("should return 404 if game with the given id was not found", async () => {
      id = new Types.ObjectId();

      const res = await exe();

      expect(res.status).toBe(404);
    });

    it("should update the game if input is valid", async () => {
      await exe();

      const updatedGame = await Game.findById(game._id).populate("genre");
      const populatedGenre = updatedGame!.genre as IGenre;

      expect(updatedGame!.title).toBe(newTitle);
      expect(populatedGenre.name).toBe(newGenre.name);
      expect(updatedGame!.numberInStock).toBe(newNumberInStock);
      expect(updatedGame!.dailyRentalRate).toBe(newDailyRentalRate);
      expect(updatedGame!.purchasePrice).toBe(newPurchasePrice);
    });

    it("should return the updated game if it is valid", async () => {
      const res = await exe();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", newTitle);
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre).toHaveProperty("name", newGenre.name);
      expect(res.body).toHaveProperty("numberInStock", newNumberInStock);
      expect(res.body).toHaveProperty("dailyRentalRate", newDailyRentalRate);
      expect(res.body).toHaveProperty("purchasePrice", newPurchasePrice);
    });
  });

  describe("DELETE /:id", () => {
    let token: string;
    let game: InstanceType<typeof Game>;
    let id: Types.ObjectId | string;

    const exe = async () => {
      return await request(server)
        .delete("/api/games/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      game = new Game({
        title: "game1",
        genre: genre._id,
        numberInStock: 1,
        dailyRentalRate: 1,
        purchasePrice: 59.99,
      });

      await game.save();

      id = game._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exe();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exe();

      expect(res.status).toBe(403);
    });

    it("should return 404 if id is invalid", async () => {
      id = "1";

      const res = await exe();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no game with the given id was found", async () => {
      id = new Types.ObjectId();

      const res = await exe();

      expect(res.status).toBe(404);
    });

    it("should delete the game if input is valid", async () => {
      await exe();

      const gameInDB = await Game.findById(id);

      expect(gameInDB).toBeNull();
    });

    it("should return the removed customer", async () => {
      const res = await exe();

      expect(res.body).toHaveProperty("_id", game._id.toHexString());
      expect(res.body).toHaveProperty("title", game.title);
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre).toHaveProperty("name", "genre1");
      expect(res.body).toHaveProperty("numberInStock", game.numberInStock);
      expect(res.body).toHaveProperty("dailyRentalRate", game.dailyRentalRate);
      expect(res.body).toHaveProperty("purchasePrice", game.purchasePrice);
    });
  });
});
