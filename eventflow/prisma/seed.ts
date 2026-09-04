import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

/**
 * Jeu de données de démonstration : un organisateur, un agent scanner, et un
 * événement publié avec deux catégories de billets. Lancer avec `npm run seed`.
 */
async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const organizer = await prisma.user.upsert({
    where: { email: "admin@eventflow.app" },
    update: {},
    create: {
      email: "admin@eventflow.app",
      passwordHash,
      name: "Organisateur Demo",
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "agent@eventflow.app" },
    update: {},
    create: {
      email: "agent@eventflow.app",
      passwordHash,
      name: "Agent Scanner Demo",
      role: "AGENT_SCAN"
    }
  });

  const title = "Cotonou Music Festival 2026";
  await prisma.event.upsert({
    where: { slug: slugify(title) },
    update: {},
    create: {
      title,
      slug: slugify(title),
      description:
        "Le plus grand festival de musique urbaine et afrobeat du Bénin, réunissant les meilleurs artistes de la sous-région pour une soirée inoubliable.",
      category: "Festival",
      city: "Cotonou",
      venue: "Stade de l'Amitié",
      address: "Route de Kouhounou, Cotonou",
      startsAt: new Date("2026-12-20T18:00:00"),
      endsAt: new Date("2026-12-21T02:00:00"),
      status: "PUBLISHED",
      organizerId: organizer.id,
      ticketTypes: {
        create: [
          { name: "Early Bird", priceXof: 5000, quota: 200 },
          { name: "Standard", priceXof: 8000, quota: 500 },
          { name: "VIP", priceXof: 20000, quota: 50 }
        ]
      }
    }
  });

  console.log("Seed terminé. Comptes de démo :");
  console.log("  admin@eventflow.app / password123 (organisateur)");
  console.log("  agent@eventflow.app / password123 (agent scanner)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
