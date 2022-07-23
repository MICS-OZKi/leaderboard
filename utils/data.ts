import * as fs from "fs";
import serverPath from "./helper";

export type leaderboardDataType = {
  nickname: string;
  score: number;
};

function createFile(filename: string) {
  fs.open(filename, "r", function (err, fd) {
    if (err) {
      fs.writeFile(filename, JSON.stringify([]), function (err) {
        if (err) {
          console.log(err);
        }
        console.log("The file was saved!");
      });
    } else {
      console.log("The file exists!");
    }
  });
}

class LeaderBoardData {
  leaderboard: leaderboardDataType[] = [];
  jsonFilePath = serverPath("public/data.json");

  constructor() {
    createFile(this.jsonFilePath);
  }

  addLeaderboardData(nickname: string, score: number) {
    fs.readFile(this.jsonFilePath, "utf8", (error, data) => {
      if (error) throw error;
      const jsonData = JSON.parse(data);
      this.leaderboard = jsonData;
      this.leaderboard.push({
        nickname: nickname,
        score: score,
      });
      fs.writeFile(
        this.jsonFilePath,
        JSON.stringify(this.leaderboard),
        function (err) {
          if (err) throw err;
          console.log("It's saved!");
        }
      );
    });
  }

  getLeaderboardData(): leaderboardDataType[] {
    return this.leaderboard;
  }
}

const leaderboardData = new LeaderBoardData();

export default leaderboardData;
