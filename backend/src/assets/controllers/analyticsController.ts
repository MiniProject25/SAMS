import { prisma } from "../../lib/prisma.js";
import { AuthRequest } from "../../users/controller/userAuthMiddleware.js";
import { Response } from "express";

const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.id;
    const assetFilter = { ownerId: userId };

    const [totalAssets, onlineAssets, offlineAssets, activeAlerts] =
      await Promise.all([
        prisma.asset.count({
          where: assetFilter,
        }),

        prisma.asset.count({
          where: { ...assetFilter, status: "ONLINE" },
        }),

        prisma.asset.count({
          where: { ...assetFilter, status: "OFFLINE" },
        }),

        prisma.alert.count({
          where: {
            isResolved: false,
            asset: assetFilter,
          },
        }),
      ]);

    res.status(200).json({
      data: {
        totalAssets,
        onlineAssets,
        offlineAssets,
        activeAlerts,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWarRoomAlerts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skipAmount = (page - 1) * limit;

    // count unique assets that have at least one unresolved alert
    const totalAssetsWithAlerts = await prisma.asset.count({
      where: {
        ownerId: req.user.id,
        alerts: {
          some: { isResolved: false }
        }
      }
    });

    // Fetch the grouped data
    const assetsWithActiveAlerts = await prisma.asset.findMany({
      where: {
        alerts: {
          some: { isResolved: false }
        }
      },
      skip: skipAmount,
      take: limit,
      orderBy: {
        alerts: {
          _count: 'desc'
        }
      },
      include: {
        alerts: {
          where: { isResolved: false },
          orderBy: { createdAt: "desc"}
        },

        telemetry: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    const totalPages = Math.ceil(totalAssetsWithAlerts / limit);

    const formattedData = assetsWithActiveAlerts.map(asset => ({
      id: asset.id,
      macAddr: asset.macAddr,
      name: asset.name,
      latestTelemetry: asset.telemetry[0] || null,
      activeAlerts: asset.alerts.map(alert => ({
        id: alert.id,
        severity: alert.type,
        metric: alert.metric, message: alert.message,
        isResolved: alert.isResolved,
        createdAt: alert.createdAt
      }))
    }));

    res.status(200).json({
      totalAssetsWithAlerts,
      totalPages: totalPages === 0 ? 1 : totalPages,
      currentPage: page,
      data: formattedData
    });


  } catch (error) {
    console.error("Error fetching war room alerts: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export { getDashboardSummary, getWarRoomAlerts };
