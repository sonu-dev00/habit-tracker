import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
            scope: true,
            expires_at: true,
          },
        },
        sessions: {
          select: {
            sessionToken: true,
            expires: true,
          },
        },
        authenticators: {
          select: {
            credentialID: true,
            providerAccountId: true,
            credentialDeviceType: true,
            counter: true,
          },
        },
        subscription: true,
        habits: {
          include: {
            completions: {
              select: {
                date: true,
                completedAt: true,
                notes: true,
              },
            },
            achievements: {
              select: {
                type: true,
                title: true,
                description: true,
                icon: true,
                xpReward: true,
                unlockedAt: true,
              },
            },
          },
        },
        userHabitData: true,
        achievements: {
          where: { habitId: null },
          select: {
            type: true,
            title: true,
            description: true,
            icon: true,
            xpReward: true,
            unlockedAt: true,
          },
        },
        userChallenges: {
          select: {
            completed: true,
            completedAt: true,
            challenge: {
              select: {
                title: true,
                description: true,
                xpReward: true,
                date: true,
              },
            },
          },
        },
        aiMessages: {
          select: {
            role: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
        aiMemories: {
          select: {
            key: true,
            value: true,
            updatedAt: true,
          },
        },
        apiUsage: {
          select: {
            endpoint: true,
            tokensUsed: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1000,
        },
        feedback: {
          select: {
            type: true,
            message: true,
            createdAt: true,
          },
        },
        supportTickets: {
          select: {
            subject: true,
            message: true,
            status: true,
            createdAt: true,
          },
        },
        auditLogs: {
          select: {
            action: true,
            entity: true,
            entityId: true,
            metadata: true,
            ip: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          select: {
            type: true,
            title: true,
            message: true,
            read: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        referralCodes: {
          select: {
            code: true,
            rewardGiven: true,
            createdAt: true,
          },
        },
        referredUsers: {
          select: {
            code: true,
            rewardGiven: true,
            createdAt: true,
          },
        },
        payments: {
          select: {
            amount: true,
            currency: true,
            status: true,
            plan: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        userFeedback: {
          select: {
            rating: true,
            category: true,
            message: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      application: "HabitForge",
      data: {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
        },
        accounts: user.accounts,
        sessions: user.sessions,
        authenticators: user.authenticators,
        subscription: user.subscription,
        habits: user.habits,
        habitStats: user.userHabitData,
        achievements: {
          global: user.achievements,
          habitSpecific: user.habits.flatMap((h) => h.achievements),
        },
        dailyChallenges: user.userChallenges,
        aiChatHistory: user.aiMessages,
        aiMemories: user.aiMemories,
        apiUsage: user.apiUsage,
        feedback: user.feedback,
        supportTickets: user.supportTickets,
        auditLog: user.auditLogs,
        notifications: user.notifications,
        referrals: {
          codesCreated: user.referralCodes,
          referredBy: user.referredUsers,
        },
        payments: user.payments,
        userFeedback: user.userFeedback,
        security: {
          twoFactorEnabled: user.twoFactorEnabled,
          banned: user.banned,
        },
      },
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="habitforge-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "Content-Length": String(Buffer.byteLength(json)),
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
