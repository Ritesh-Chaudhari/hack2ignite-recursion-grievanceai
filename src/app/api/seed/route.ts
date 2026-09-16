import { NextResponse } from "next/server";
import { countGrievances, insertGrievance } from "@/lib/store";
import type { Grievance } from "@/lib/types";

/**
 * Demo data seeder (prototype only): POST /api/seed
 * Populates a set of realistic grievances across categories, priorities and
 * statuses so the admin dashboard and analytics are populated for demos.
 */

interface SeedSpec {
  title: string;
  description: string;
  language: Grievance["language"];
  category: Grievance["category"];
  priority: Grievance["priority"];
  status: Grievance["status"];
  location: string;
  submitterName: string;
  hoursAgo: number;
  aiSummary: string;
}

const SEEDS: SeedSpec[] = [
  {
    title: "Live electric wire hanging over school lane",
    description:
      "A high-tension wire snapped in last night's storm and is hanging low over the lane leading to the primary school. Children walk under it every morning. Someone could be electrocuted.",
    language: "English",
    category: "Electricity",
    priority: "Urgent",
    status: "In Progress",
    location: "Shivaji Nagar, Ward 12",
    submitterName: "Anita Deshmukh",
    hoursAgo: 5,
    aiSummary:
      "Snapped high-tension wire hanging over a school lane in Shivaji Nagar, Ward 12, posing immediate electrocution risk to schoolchildren.",
  },
  {
    title: "Contaminated water supply for three days",
    description:
      "The tap water smells foul and looks brownish since Saturday. Several families have already had stomach infections. We are buying bottled water but cannot afford it for long.",
    language: "English",
    category: "Water",
    priority: "Urgent",
    status: "Pending",
    location: "Gandhi Chowk, Ward 7",
    submitterName: "Rahul Patil",
    hoursAgo: 9,
    aiSummary:
      "Residents of Gandhi Chowk, Ward 7 reporting discolored, foul-smelling water for three days with suspected contamination and illness cases.",
  },
  {
    title: "सार्वजनिक शौचालय अत्यंत गंदगी ( filthy public toilet block )",
    description:
      "बस स्थानकाजवळील सार्वजनिक शौचालय आठवड्याभरापासून साफ केलेले नाही. दुर्गंधीमुळे जवळच्या दुकानांना त्रास होत आहे. कचरा उचलण्यास दवंडी पाठवा.",
    language: "Marathi",
    category: "Sanitation",
    priority: "High",
    status: "Pending",
    location: "Nagpur Road Bus Stand",
    submitterName: "Sunita Kale",
    hoursAgo: 26,
    aiSummary:
      "Public toilet block near the Nagpur Road bus stand uncleaned for a week; foul odor affecting nearby shops, garbage pickup requested.",
  },
  {
    title: "मुख्य सड़क पर गड्ढों से दुर्घटनाएँ",
    description:
      "मार्केट रोड पर पिछली बारिश के बाद बड़े-बड़े गड्ढे बन गए हैं। रात में दो बाइक सवार गिर चुके हैं। स्पीड ब्रेकर के पास पानी भरने से गड्ढे दिखाई नहीं देते।",
    language: "Hindi",
    category: "Roads",
    priority: "High",
    status: "In Progress",
    location: "Market Road, Ward 3",
    submitterName: "Imran Shaikh",
    hoursAgo: 40,
    aiSummary:
      "Large rain-damaged potholes on Market Road, Ward 3 near the speed breaker causing motorcycle accidents at night; water logging hides them.",
  },
  {
    title: "Streetlights not working near park",
    description:
      "Around eight streetlight poles on the lane by the community park are dead for two weeks. The stretch is completely dark after 7 pm and women avoid the route.",
    language: "English",
    category: "Electricity",
    priority: "High",
    status: "Pending",
    location: "Shivaji Nagar, Ward 12",
    submitterName: "Priya Nair",
    hoursAgo: 60,
    aiSummary:
      "Eight streetlight poles dead for two weeks near the community park in Shivaji Nagar, leaving the stretch dark and unsafe after 7 pm.",
  },
  {
    title: "Garbage not collected from society bins",
    description:
      "The municipal truck has not come to our society for over a week. Bins are overflowing and stray dogs are spreading waste on the road every morning.",
    language: "English",
    category: "Sanitation",
    priority: "Medium",
    status: "In Progress",
    location: "Gandhi Chowk, Ward 7",
    submitterName: "Vikram Joshi",
    hoursAgo: 76,
    aiSummary:
      "Municipal garbage collection missed for over a week at a society in Gandhi Chowk, Ward 7; overflowing bins attracting stray dogs.",
  },
  {
    title: "Low water pressure in evening hours",
    description:
      "Water pressure drops badly between 6 and 9 pm on our floor. Washing and cooking become difficult. This has been happening for about ten days.",
    language: "English",
    category: "Water",
    priority: "Medium",
    status: "Pending",
    location: "Nehru Nagar, Ward 5",
    submitterName: "Farhan Qureshi",
    hoursAgo: 90,
    aiSummary:
      "Low water pressure between 6-9 pm on upper floors in Nehru Nagar, Ward 5 for roughly ten days, disrupting household chores.",
  },
  {
    title: "Fallen tree blocking the service road",
    description:
      "A tree fell across the service road near the petrol pump last night. Two-wheelers are squeezing past on the footpath. It needs the fire brigade or garden department.",
    language: "English",
    category: "Other",
    priority: "Urgent",
    status: "Resolved",
    location: "NH-53 Service Road",
    submitterName: "Meera Iyer",
    hoursAgo: 120,
    aiSummary:
      "Tree uprooted across the NH-53 service road near the petrol pump overnight, blocking traffic; fire brigade removal requested.",
  },
  {
    title: "झाड़तोडणी नंतर उभा राहिलेला तोडगेलेला झाडाचा खोड",
    description:
      "झाड़तोडणी नंतर खोड उभे राहिले आहे आणि खाली धोकादायकरिता झुकलेले आहे. रस्त्यावरून जाणाऱ्या वाहनांवर पडू शकते. लगेच काढा.",
    language: "Marathi",
    category: "Safety",
    priority: "High",
    status: "Resolved",
    location: "NH-53 Service Road",
    submitterName: "Sagar More",
    hoursAgo: 140,
    aiSummary:
      "Unstable half-cut tree trunk left leaning over the NH-53 service road after trimming, risking falling onto passing vehicles.",
  },
  {
    title: "Frequent power cuts in industrial area",
    description:
      "Unscheduled power cuts four to five times daily for the past fortnight. Small workshops are losing hours of production every day.",
    language: "English",
    category: "Electricity",
    priority: "Medium",
    status: "Resolved",
    location: "MIDC Industrial Estate",
    submitterName: "Deepak Rane",
    hoursAgo: 160,
    aiSummary:
      "Unscheduled power cuts four to five times daily for two weeks across the MIDC industrial estate, hurting small workshop productivity.",
  },
];

export async function POST() {
  const existing = await countGrievances();
  // Allow seeding even after a few real test submissions, so the demo
  // dashboard is always populated; only skip when data is already rich.
  if (existing >= 5) {
    return NextResponse.json({ seeded: false, message: "Data already exists." });
  }

  const grievances: Grievance[] = SEEDS.map((s, index) => {
    const createdAt = new Date(Date.now() - s.hoursAgo * 3_600_000).toISOString();
    return {
      id: `seed-${index + 1}`,
      title: s.title,
      description: s.description,
      language: s.language,
      category: s.category,
      priority: s.priority,
      status: s.status,
      location: s.location,
      submittedBy: "seed-demo",
      submitterName: s.submitterName,
      createdAt,
      updatedAt: createdAt,
      aiSummary: s.aiSummary,
      aiProcessed: true,
      duplicateOf:
        s.title === "Streetlights not working near park"
          ? ["seed-1"]
          : s.title === "झाड़तोडणी नंतर उभा राहिलेला तोडगेलेला झाडाचा खोड"
            ? ["seed-8"]
            : undefined,
    } satisfies Grievance;
  });

  for (const g of grievances) {
    await insertGrievance(g);
  }
  return NextResponse.json({ seeded: true, count: grievances.length });
}
