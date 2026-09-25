import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const skillNames = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "UI/UX Design",
  "Figma",
  "Python",
  "Copywriting",
];

async function main() {
  // Start from a clean slate so the seed can be re-run.
  await db.review.deleteMany();
  await db.proposal.deleteMany();
  await db.project.deleteMany();
  await db.freelancerProfile.deleteMany();
  await db.user.deleteMany();
  await db.skill.deleteMany();

  const skills = Object.fromEntries(
    await Promise.all(
      skillNames.map(async (name) => [name, await db.skill.create({ data: { name } })] as const),
    ),
  );
  const connect = (...names: string[]) => names.map((name) => ({ id: skills[name].id }));

  // Every demo account uses the same password.
  const passwordHash = await bcrypt.hash("password123", 10);

  const client = await db.user.create({
    data: { name: "Aisha Khan", email: "client@demo.dev", passwordHash, role: "CLIENT" },
  });

  const dev = await db.user.create({
    data: {
      name: "Rahul Mehta",
      email: "dev@demo.dev",
      passwordHash,
      role: "FREELANCER",
      freelancerProfile: {
        create: {
          headline: "Full-stack developer (React / Node)",
          bio: "I build fast, accessible web apps end to end.",
          hourlyRateCents: 3500,
          skills: { connect: connect("React", "Next.js", "TypeScript", "Node.js", "PostgreSQL") },
        },
      },
    },
  });

  const designer = await db.user.create({
    data: {
      name: "Sara Lopez",
      email: "designer@demo.dev",
      passwordHash,
      role: "FREELANCER",
      freelancerProfile: {
        create: {
          headline: "Product designer",
          bio: "UX research, wireframes and polished UI in Figma.",
          hourlyRateCents: 4000,
          skills: { connect: connect("UI/UX Design", "Figma") },
        },
      },
    },
  });

  const landingPage = await db.project.create({
    data: {
      title: "Landing page for a coffee subscription startup",
      description: "Responsive marketing site with a pricing section and email signup.",
      budgetCents: 60000,
      clientId: client.id,
      skills: { connect: connect("React", "Next.js", "UI/UX Design") },
    },
  });

  await db.project.create({
    data: {
      title: "Redesign onboarding flow for a fitness app",
      description: "Audit the current onboarding and deliver high-fidelity Figma screens.",
      budgetCents: 45000,
      clientId: client.id,
      skills: { connect: connect("UI/UX Design", "Figma") },
    },
  });

  const dashboard = await db.project.create({
    data: {
      title: "Internal sales dashboard",
      description: "Next.js dashboard reading from an existing Postgres database.",
      budgetCents: 120000,
      status: "COMPLETED",
      clientId: client.id,
      freelancerId: dev.id,
      skills: { connect: connect("Next.js", "TypeScript", "PostgreSQL") },
    },
  });

  await db.proposal.createMany({
    data: [
      {
        projectId: landingPage.id,
        freelancerId: dev.id,
        coverLetter: "I've shipped several Next.js marketing sites and can deliver in a week.",
        bidCents: 55000,
        estimatedDays: 7,
      },
      {
        projectId: landingPage.id,
        freelancerId: designer.id,
        coverLetter: "I can design and hand off a pixel-perfect page.",
        bidCents: 60000,
        estimatedDays: 10,
      },
      {
        projectId: dashboard.id,
        freelancerId: dev.id,
        coverLetter: "Happy to build this with server components and Prisma.",
        bidCents: 115000,
        estimatedDays: 14,
        status: "ACCEPTED",
      },
    ],
  });

  await db.review.createMany({
    data: [
      {
        projectId: dashboard.id,
        authorId: client.id,
        subjectId: dev.id,
        rating: 5,
        comment: "Delivered early and communicated clearly throughout.",
      },
      {
        projectId: dashboard.id,
        authorId: dev.id,
        subjectId: client.id,
        rating: 5,
        comment: "Clear requirements and quick feedback.",
      },
    ],
  });

  console.log("Seeded demo data. Log in with client@demo.dev / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
