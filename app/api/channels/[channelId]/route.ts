import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params } : { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);

        console.log(name, type);

        const serverId = searchParams.get("serverId");

        if (name === "general") {
            return new NextResponse("Cannot delete 'general' channel", { status: 400 });
        }
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 }) ; 
        }

        if (!serverId) {
            return new NextResponse("Server Id missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel Id missing", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.MODERATOR, MemberRole.ADMIN]
                        }
                    }
                }
            },
            data: {
                channels: {
                    update: {
                        where: {
                            id: params.channelId,
                            name: {
                                not: "general"
                            },
                        },
                        data: {
                            name,
                            type
                        }
                    }
                }
            }
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log(err)
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params } : { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 }) ; 
        }

        if (!serverId) {
            return new NextResponse("Server Id missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel Id missing", { status: 400 });
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.MODERATOR, MemberRole.ADMIN]
                        }
                    }
                }
            },
            data: {
                channels: {
                    delete: {
                        id: params.channelId,
                        name: {
                            not: "general"
                        }
                    }
                }
            }
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log(err)
        return new NextResponse("Internal Error", { status: 500 });
    }
}