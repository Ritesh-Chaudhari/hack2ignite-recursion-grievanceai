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
  recommendedResolution: string;
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
    recommendedResolution:
      "Isolate power to the feeder immediately and place a barricade and spotter at the lane. Replace the snapped conductor, re-tension it, then restore supply only after an earth and continuity test. Expected within 24 hours (Urgent).",
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
    recommendedResolution:
      "Take grab samples from the affected main and the source reservoir for lab testing the same day, and run a chlorination shock dose on the affected branch. Issue a boil-water advisory until results clear, then flush the line. Expected within 24 hours (Urgent).",
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
    recommendedResolution:
      "Assign a deep-cleaning crew with a jetting machine and disinfectant to the block, clear the choked waste line, and restock consumables. Add the block to a fixed daily cleaning roster and verify with a photo log. Expected within 2-3 days (High).",
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
    recommendedResolution:
      "Mark and barricade the potholes, drain the standing water, then patch with wet-mix in compacted layers rather than loose fill. Desilt the nearby drain so water does not re-open the patch, and re-mark the speed breaker. Expected within 2-3 days (High).",
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
    recommendedResolution:
      "Trace the circuit feeding these poles for a tripped feeder or cable fault, replace the failed LED gear and any dead photocell, and restore supply after an insulation test. Check the neighbouring poles on the same run while on site. Expected within 2-3 days (High).",
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
    recommendedResolution:
      "Send a pickup truck to clear the overflowing bins and clean the spill, then put the society on a fixed alternate-day collection slot with a named contractor. Confirm with the society secretary before marking resolved. Expected within a week (Medium).",
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
    recommendedResolution:
      "Check the timing pump schedule and the non-return valve for the overhead tank, and look for a partially closed or leaking valve on the branch. Verify residual pressure at the farthest tap during peak hours after the fix. Expected within a week (Medium).",
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
    recommendedResolution:
      "Clear the trunk with a chainsaw crew and tow the debris to restore one lane of traffic first, then check for a damaged streetlight pole or underground cable before reopening fully. Expected within 24 hours (Urgent); already completed for this record.",
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
    recommendedResolution:
      "Cordon the stretch, then fell the leaning trunk in controlled sections from a hydraulic platform rather than by hand. Clear the stump to ground level and inspect the canopy above for hanging limbs. Expected within 2-3 days (High); already completed for this record.",
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
    recommendedResolution:
      "Pull the feeder fault log and check for an overloaded or failing distribution transformer on this feed. Replace the faulty oil or connections, rebalance the load across phases, and share the revised supply schedule with the estate association. Expected within a week (Medium); already completed for this record.",
  },
];

async function doSeed(): Promise<{ seeded: boolean; count?: number }> {
  const existing = await countGrievances();
  // Allow seeding even after a few real test submissions, so the demo
  // dashboard is always populated; only skip when data is already rich.
  if (existing >= 5) {
    return { seeded: false };
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
      recommendedResolution: s.recommendedResolution,
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
  return { seeded: true, count: grievances.length };
}

/** POST /api/seed — Manual seed endpoint. */
export async function POST() {
  const result = await doSeed();
  if (!result.seeded) {
    return NextResponse.json({ seeded: false, message: "Data already exists." });
  }
  return NextResponse.json({ seeded: true, count: result.count });
}

/** GET /api/seed — Auto-seed on first boot (called by the app on initial load). */
export async function GET() {
  const result = await doSeed();
  return NextResponse.json(result);
}
