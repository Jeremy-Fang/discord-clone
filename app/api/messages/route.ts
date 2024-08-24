import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server"

const MESSAGES_BATCH = 10;

export async function GET(
    req: Request
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const skip = searchParams.get("skip");
        const channelId = searchParams.get("channelId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!channelId) {
            return new NextResponse("Channel Id missing", { status: 400 });
        }

        if (!skip) {
            return new NextResponse("Skip missing", { status: 400 });
        }

        let skipInt = parseInt(skip);

        let messages: Message[] = await db.message.findMany({
            take: MESSAGES_BATCH,
            skip: skipInt,
            where: {
                channelId
            },
            include: {
                member: {
                    include: {
                        profile: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        
        if (messages.length === MESSAGES_BATCH) {
            skipInt += MESSAGES_BATCH
        }

        return NextResponse.json({
            items: messages,
            skipInt
        });
    } catch (err) {
        console.log(err)
        return new NextResponse("Internal Error", { status: 500 });
    }
}