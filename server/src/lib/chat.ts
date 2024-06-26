import { IChatRoom, IMessage } from "@common/types";
import { prisma } from "./prisma";

export async function sendMessage(
  user_id: string,
  room_id: string,
  content: string
) {
  try {
    await prisma.message.create({
      data: {
        content,
        userId: user_id,
        chatRoomId: room_id,
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export async function unsendMessage(message_id: string) {
  try {
    await prisma.message.delete({
      where: {
        id: message_id,
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export async function getMessages(room_id: string): Promise<IMessage[]> {
  const messages = await prisma.message.findMany({
    where: {
      chatRoomId: room_id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
  return messages;
}

export async function getChatRooms(): Promise<IChatRoom[]> {
  const chatRooms = await prisma.chatRoom.findMany({
    include: {
      members: { select: { id: true, username: true } },
    },
  });
  return chatRooms;
}

export async function createChatRoom(
  name: string,
  id: string[],
  group: boolean = true
) {
  try {
    if (!group && id.length !== 2) {
      console.log("DM room must have 2 members");
      return;
    }
    if (!group) {
      const room = await prisma.chatRoom.findFirst({
        where: {
          AND: [
            {
              members: {
                some: {
                  id: id[0],
                },
              },
            },
            {
              members: {
                some: {
                  id: id[1],
                },
              },
            },
            {
              group: false,
            },
          ],
        },
      });
      if (room) {
        console.log("DM room already exists");
        return;
      }
    }
    return await prisma.chatRoom.create({
      data: {
        name,
        group: group,
        members: {
          connect: id.map((i) => ({ id: i })),
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export async function enterChatRoom(user_id: string, room_id: string) {
  try {
    await prisma.chatRoom.update({
      where: {
        id: room_id,
      },
      data: {
        members: {
          connect: {
            id: user_id,
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export async function leaveChatRoom(user_id: string, room_id: string) {
  try {
    await prisma.chatRoom.update({
      where: {
        id: room_id,
      },
      data: {
        members: {
          disconnect: {
            id: user_id,
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}
