export interface TeamMember {
  id: string;
  name: string;
  role: string;
  nickname?: string;
  image: string;
}

export const coreTeam: TeamMember[] = [
  { id: "c1",  name: "Aarav Mehta",      role: "President",             nickname: "The Architect",  image: "" },
  { id: "c2",  name: "Priya Sharma",     role: "Vice President",        nickname: "Priya S",        image: "" },
  { id: "c3",  name: "Rohan Verma",      role: "General Secretary",     nickname: "RoV",            image: "" },
  { id: "c4",  name: "Sneha Patel",      role: "Joint Secretary",       nickname: "Snix",           image: "" },
  { id: "c5",  name: "Karan Joshi",      role: "Treasurer",             nickname: "KJ",             image: "" },
  { id: "c6",  name: "Ananya Gupta",     role: "Event Head",            nickname: "Ana G",          image: "" },
  { id: "c7",  name: "Vikram Singh",     role: "Technical Head",        nickname: "Vikster",        image: "" },
  { id: "c8",  name: "Ishaan Roy",       role: "Marketing Head",        nickname: "IR",             image: "" },
  { id: "c9",  name: "Tanvi Nair",       role: "PR Head",               nickname: "Tanvi",          image: "" },
  { id: "c10", name: "Arjun Kapoor",     role: "Logistics Head",        nickname: "AK",             image: "" },
  { id: "c11", name: "Meera Iyer",       role: "Design Head",           nickname: "Meera",          image: "" },
  { id: "c12", name: "Siddharth Das",    role: "Content Head",          nickname: "Siddhz",         image: "" },
  { id: "c13", name: "Nisha Pillai",     role: "Sponsorship Head",      nickname: "Nix",            image: "" },
  { id: "c14", name: "Dev Malhotra",     role: "Operations Head",       nickname: "DevM",           image: "" },
  { id: "c15", name: "Kavya Reddy",      role: "Cultural Head",         nickname: "KR",             image: "" },
  { id: "c16", name: "Rahul Bose",       role: "Sports Head",           nickname: "Rahul B",        image: "" },
  { id: "c17", name: "Aisha Khan",       role: "Photography Head",      nickname: "Aish",           image: "" },
  { id: "c18", name: "Nikhil Tiwari",    role: "Video Head",            nickname: "NikhilT",        image: "" },
  { id: "c19", name: "Pooja Saxena",     role: "Social Media Head",     nickname: "PJ",             image: "" },
  { id: "c20", name: "Yash Agarwal",     role: "Workshop Head",         nickname: "Yash A",         image: "" },
  { id: "c21", name: "Divya Menon",      role: "Outreach Head",         nickname: "DivM",           image: "" },
  { id: "c22", name: "Arnav Chauhan",    role: "Innovation Head",       nickname: "ArnC",           image: "" },
  { id: "c23", name: "Shruti Bajaj",     role: "Coordinator",           nickname: "Shruti",         image: "" },
];

export const websiteTeam: TeamMember[] = [
  { id: "w1", name: "Aman Trivedi",     role: "Lead Developer",        nickname: "AmanT",   image: "" },
  { id: "w2", name: "Ritika Soni",      role: "Frontend Dev",          nickname: "Ritu",    image: "" },
  { id: "w3", name: "Harsh Dubey",      role: "Backend Dev",           nickname: "HarsD",   image: "" },
  { id: "w4", name: "Simran Kaur",      role: "UI/UX Designer",        nickname: "SimK",    image: "" },
  { id: "w5", name: "Pranav Mishra",    role: "Full Stack Dev",        nickname: "PranM",   image: "" },
  { id: "w6", name: "Lata Choudhary",   role: "QA Engineer",           nickname: "LataC",   image: "" },
  { id: "w7", name: "Vivek Pandey",     role: "DevOps",                nickname: "VivP",    image: "" },
  { id: "w8", name: "Neha Ghosh",       role: "Content Strategist",    nickname: "NehG",    image: "" },
];

export const graphicsTeam: TeamMember[] = [
  { id: "g1", name: "Tanya Jain",       role: "Lead Designer",         nickname: "TanyJ",   image: "" },
  { id: "g2", name: "Rohit Kulkarni",   role: "Motion Graphics",       nickname: "RohK",    image: "" },
  { id: "g3", name: "Anjali Rao",       role: "Illustrator",           nickname: "AnjR",    image: "" },
  { id: "g4", name: "Sumit Pathak",     role: "Brand Designer",        nickname: "SumP",    image: "" },
  { id: "g5", name: "Charu Shukla",     role: "3D Artist",             nickname: "CharS",   image: "" },
  { id: "g6", name: "Manav Grover",     role: "Video Editor",          nickname: "ManG",    image: "" },
];
