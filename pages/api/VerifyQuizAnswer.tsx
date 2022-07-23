// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { EXPECTED_HASH, gameProofFileName } from "config/config";
import type { NextApiRequest, NextApiResponse } from "next";
import leaderboardData from "utils/data";
import serverPath from "utils/helper";
import ProofVerifier  from "ozki-toolkit";
import { ProofRequiredOutput } from "ozki-toolkit";
import { parse } from "path";

export interface ParsedAnswerInfo {
    answerNo:       number;
    answerHash:     Array<bigint>
}

export class ProofOfHashVerifier extends ProofVerifier<ParsedAnswerInfo> {
    private timeStamp: number = 0;
    private number: number = 0;
    private hash: Array<bigint> = [];

    constructor(
        zkpComponentPath: string,
        zkpComponentName: string
        ) {
        console.log("#### >>ProofOfHashVerifier.ctor:");
        super(zkpComponentPath, zkpComponentName);
        console.log("#### <<ProofOfHashVerifier.ctor:");
    }

    protected parseRequiredOutput(output: Array<string>): ProofRequiredOutput {
        // the corresponding circom output signal must follow this order (name-insensitive):
        // - timeStamp
        // - constraintStatus
        this.parseOutputInternal(output);
        let status = (this.number == 1) && this.compareWithExpectedHash();
        console.log("#### parseRequiredOutput: constraint-status=%s", status);

        return {timeStamp: this.timeStamp, constraintStatus: status};
    }

    protected parseCustomOutput(output: Array<string>): ParsedAnswerInfo {
        let info : ParsedAnswerInfo = {
            answerNo: this.number,
            answerHash: this.hash
        };

        return info;
    }

    private parseOutputInternal(publicSignals: any) {
        this.timeStamp  = Number.parseInt(publicSignals[0]);
        this.number = Number.parseInt(publicSignals[1]);
        console.log("#### parseOutputInternal: number=%d, timestamp=%d", this.number, this.timeStamp);

        for (let i = 0; i < (publicSignals.length - 2); i++)
            this.hash.push(BigInt(publicSignals[2 + i]));
    }

    private compareWithExpectedHash(): boolean {
        let status = true;
        if (this.hash.length == EXPECTED_HASH.length) {
            for (let i = 0; i < this.hash.length; i++) {
                if (this.hash[i] != EXPECTED_HASH[i]) {
                    status = false;
                    break;
                }
            }
        }
        else {
            status = false;
        }

        return status;
    }
}

type Data = {
  success: boolean;
};

const verifyQuizAnswer = async (
  proof: string,
  publicSignals: string[],
  nickname: string
): Promise<boolean> => {
  //const verifier = new GetAnswerHashVerifier();
  const FilePath = serverPath("public/verifier/");
  const verifier = new ProofOfHashVerifier(FilePath, gameProofFileName);

  try {
    const parsedAnswerInfo = await verifier.verifyProof(proof, publicSignals);
    console.log("nickname=%s, answer-no: %d", nickname, parsedAnswerInfo?.answerNo);
    console.log("verification completed");
    leaderboardData.addLeaderboardData(
      nickname ? nickname : "anonymous",
      100
    );
    return true;
  }
  catch (error) {
    console.log(error);
  }

  return false;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const isLeaderBoard = await verifyQuizAnswer(
      req.body.proof,
      req.body.output,
      req.body.nickname
    );
    if (isLeaderBoard) {
      res.statusCode = 200;
      res.send({
        success: true,
      });
    } else {
      res.statusCode = 400;
      res.send({
        success: false,
      });
    }
  }
}