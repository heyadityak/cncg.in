export type CityGroup = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  organizer?: string;
  description?: string;
  ocGroupUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
};

export type StateGroup = {
  slug: string;
  name: string;
  /** State centroid coordinates for map centering */
  lat: number;
  lng: number;
  cities: CityGroup[];
};

export const groups: StateGroup[] = [
  {
    slug: "karnataka",
    name: "Karnataka",
    lat: 15.3173,
    lng: 75.7139,
    cities: [
      {
        slug: "bangalore",
        name: "Bengaluru",
        lat: 12.9716,
        lng: 77.5946,
        organizer: "CNCG Bengaluru Team",
        description:
          "Cloud Native Computing Group Bengaluru is one of the most active cloud-native communities in India, running regular sessions on Kubernetes, cloud-native architecture, and CNCF projects.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/52r68y4",
        twitterUrl: "https://twitter.com/cncgblr",
      },
      {
        slug: "mysore",
        name: "Mysuru",
        lat: 12.2958,
        lng: 76.6394,
        organizer: "CNCG Mysore Team",
        description:
          "Cloud Native Computing Group Mysuru brings cloud-native technology to the Palace City, connecting developers and enthusiasts around Kubernetes, observability, and open-source tools.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/czbercj",
      },
      {
        slug: "platform-engineering-bengaluru",
        name: "Platform Engineering Bengaluru",
        lat: 12.9716,
        lng: 77.5946,
        organizer: "Resiliency & Platform Engineering Bengaluru Team",
        description:
          "Platform Engineering & Resilience Engineering Meetup is a community for practitioners, builders, and curious minds working at the intersection of developer enablement, scalable infrastructure, and system reliability — covering IDPs, SRE, and intelligent automation.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/fr753cc",
      },
    ],
  },
  {
    slug: "maharashtra",
    name: "Maharashtra",
    lat: 19.7515,
    lng: 75.7139,
    cities: [
      {
        slug: "mumbai",
        name: "Mumbai",
        lat: 19.076,
        lng: 72.8777,
        organizer: "CNCG Mumbai Team",
        description:
          "Cloud Native Computing Group Mumbai brings together developers, architects, and IT professionals to explore Kubernetes, microservices, and cloud-native patterns in the Mumbai tech ecosystem.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/k33mmvw",
      },
      {
        slug: "pune",
        name: "Pune",
        lat: 18.5204,
        lng: 73.8567,
        organizer: "CNCG Pune Team",
        description:
          "Cloud Native Computing Group Pune is a vibrant community of cloud-native enthusiasts, covering topics from container orchestration to service meshes and GitOps.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/p5hsakp",
      },
      {
        slug: "thane",
        name: "Thane",
        lat: 19.2183,
        lng: 72.9781,
        organizer: "CNCG Thane Team",
        description:
          "Cloud Native Computing Group Thane serves the growing tech community of Thane, focusing on cloud-native tooling and practices for modern application development.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/8y6vc7x",
      },
      {
        slug: "nagpur",
        name: "Nagpur",
        lat: 21.1458,
        lng: 79.0882,
        organizer: "CNCG Nagpur Team",
        description:
          "Cloud Native Computing Group Nagpur connects cloud-native practitioners in Central India, promoting open-source and CNCF technologies.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/8795kew",
      },
      {
        slug: "nashik",
        name: "Nashik",
        lat: 19.9975,
        lng: 73.7898,
        organizer: "CNCG Nashik Team",
        description:
          "Cloud Native Nashik is a thriving community of developers, engineers, and technology enthusiasts focused on cloud-native technologies, organizing regular meetups, workshops, and knowledge-sharing sessions.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/wsvh9fb",
      },
      {
        slug: "aurangabad",
        name: "Chhatrapati Sambhajinagar",
        lat: 19.8762,
        lng: 75.3433,
        organizer: "CNCG Aurangabad Team",
        description:
          "Cloud Native Aurangabad connects cloud enthusiasts, experts, and businesses in Maharashtra's Marathwada region, sharing insights on the latest cloud technologies and trends.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/v8mac42",
      },
      {
        slug: "jalgaon",
        name: "Jalgaon",
        lat: 21.0077,
        lng: 75.5626,
        organizer: "CNCG Jalgaon Team",
        description:
          "Cloud Native Jalgaon is a community dedicated to helping people learn about cloud-native technologies, connecting local talent with the growing world of cloud-native solutions through training, resources, and events focused on DevOps, cloud computing, and open-source software.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/63wz5ng",
      },
      {
        slug: "kubernetes-pune",
        name: "Kubernetes Pune",
        lat: 18.5204,
        lng: 73.8567,
        organizer: "Kubernetes Pune Team",
        description:
          "Kubernetes Pune is a group for all Kubernauts who want to learn and share experiences about Kubernetes. This community is for all skill levels — from beginners to experienced professionals — discussing Kubernetes, service discovery, load balancing, networking, storage, and more.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/h79jub8",
      },
    ],
  },
  {
    slug: "gujarat",
    name: "Gujarat",
    lat: 22.2587,
    lng: 71.1924,
    cities: [
      {
        slug: "ahmedabad",
        name: "Ahmedabad",
        lat: 23.0225,
        lng: 72.5714,
        organizer: "CNCG Ahmedabad Team",
        description:
          "Cloud Native Computing Group Ahmedabad is Gujarat's premier cloud-native community, hosting talks and workshops on Kubernetes, Prometheus, and the broader CNCF ecosystem.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/pfcyuzd",
      },
      {
        slug: "gandhinagar",
        name: "Gandhinagar",
        lat: 23.2156,
        lng: 72.6369,
        organizer: "CNCG Gandhinagar Team",
        description:
          "Cloud Native Computing Group Gandhinagar serves Gujarat's capital city, bringing together Kubernetes and cloud-native enthusiasts for meetups, workshops, and deep-dives into CNCF projects.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/q26xxhw",
      },
      {
        slug: "rajkot",
        name: "Rajkot",
        lat: 22.3039,
        lng: 70.8022,
        organizer: "CNCG Rajkot Team",
        description:
          "Cloud Native Computing Group Rajkot serves the tech professionals of Saurashtra, exploring cloud-native tools and DevOps best practices.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/jy57rcj",
      },
      {
        slug: "vadodara",
        name: "Vadodara",
        lat: 22.3072,
        lng: 73.1812,
        organizer: "CNCG Vadodara Team",
        description:
          "Cloud Native Computing Group Vadodara brings cloud-native education to Baroda, covering container technologies, cloud architectures, and open-source tools.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/q486qd9",
      },
      {
        slug: "surat",
        name: "Surat",
        lat: 21.1702,
        lng: 72.8311,
        organizer: "CNCG Surat Team",
        description:
          "Cloud Native Computing Group Surat connects the cloud-native community in South Gujarat, hosting events and knowledge-sharing sessions.",
      },
    ],
  },
  {
    slug: "delhi",
    name: "Delhi",
    lat: 28.7041,
    lng: 77.1025,
    cities: [
      {
        slug: "new-delhi",
        name: "New Delhi",
        lat: 28.6139,
        lng: 77.209,
        organizer: "CNCG Delhi Team",
        description:
          "Cloud Native Computing Group Delhi is a fast-growing community in the national capital region, focusing on Kubernetes, cloud-native security, and open-source contributions.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/9fryhhb",
        twitterUrl: "https://twitter.com/cncgdel",
      },
      {
        slug: "security-india",
        name: "Cloud Native Security India",
        lat: 28.6139,
        lng: 77.209,
        organizer: "Cloud Native Security India Team",
        description:
          "Cloud Native Security India is a pan-India community exploring the dynamic world of cloud-native security practices, dedicated to fostering professionals, enthusiasts, and experts passionate about staying at the forefront of cloud-native security trends.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/6puhmjb",
      },
    ],
  },
  {
    slug: "telangana",
    name: "Telangana",
    lat: 17.123,
    lng: 79.2088,
    cities: [
      {
        slug: "hyderabad",
        name: "Hyderabad",
        lat: 17.385,
        lng: 78.4867,
        organizer: "CNCG Hyderabad Team",
        description:
          "Cloud Native Computing Group Hyderabad is one of India's most active CNCF communities, running monthly sessions on Kubernetes, Istio, and cloud-native observability.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/wwpsss3",
      },
    ],
  },
  {
    slug: "tamil-nadu",
    name: "Tamil Nadu",
    lat: 11.1271,
    lng: 78.6569,
    cities: [
      {
        slug: "chennai",
        name: "Chennai",
        lat: 13.0827,
        lng: 80.2707,
        organizer: "CNCG Chennai Team",
        description:
          "Cloud Native Computing Group Chennai is the gateway to cloud-native technologies in South India, hosting talks on Kubernetes, cloud cost optimisation, and CNCF project deep-dives.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/96ne96f",
      },
      {
        slug: "coimbatore",
        name: "Coimbatore",
        lat: 11.0168,
        lng: 76.9558,
        organizer: "CNCG Coimbatore Team",
        description:
          "Cloud Native Computing Group Coimbatore drives cloud-native adoption in Tamil Nadu's industrial city, with workshops and hackathons for the local developer community.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/3z5cts7",
      },
      {
        slug: "trichy",
        name: "Tiruchirappalli",
        lat: 10.7905,
        lng: 78.7047,
        organizer: "CNCG Trichy Team",
        description:
          "Cloud Native Trichy is a passionate community of cloud-native enthusiasts exploring modern architecture, DevOps, CI/CD, Kubernetes, service mesh, security, and observability in the Temple City.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/gmzewhx",
      },
      {
        slug: "madurai",
        name: "Madurai",
        lat: 9.9252,
        lng: 78.1198,
        organizer: "CNCG Madurai Team",
        description:
          "Kubernetes Madurai is a community for cloud-native and Kubernetes enthusiasts in South Tamil Nadu, hosting meetups for all skill levels from beginners to experienced professionals.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/k7zezcd",
      },
      {
        slug: "pollachi",
        name: "Pollachi",
        lat: 10.6594,
        lng: 77.0075,
        organizer: "CNCG Pollachi Team",
        description:
          "Cloud Native Pollachi is an official CNCF community group bringing cloud-native technologies to the Pollachi region of Tamil Nadu.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/8cs7bfd",
      },
    ],
  },
  {
    slug: "west-bengal",
    name: "West Bengal",
    lat: 22.9868,
    lng: 87.855,
    cities: [
      {
        slug: "kolkata",
        name: "Kolkata",
        lat: 22.5726,
        lng: 88.3639,
        organizer: "CNCG Kolkata Team",
        description:
          "Cloud Native Computing Group Kolkata is East India's premier cloud-native community, bringing together engineers and architects to explore CNCF projects and cloud-native patterns.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/9qb7ddk",
      },
      {
        slug: "durgapur",
        name: "Durgapur",
        lat: 23.5204,
        lng: 87.3119,
        organizer: "CNCG Durgapur Team",
        description:
          "Cloud Native Durgapur is a dynamic community affiliated with the CNCF, revolutionizing the cloud-native ecosystem in the Durgapur region through networking, education, and collaboration.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/eqafue9",
      },
      {
        slug: "hooghly",
        name: "Hooghly",
        lat: 22.9,
        lng: 88.3967,
        organizer: "CNCG Hooghly Team",
        description:
          "Cloud Native Hooghly is a vibrant CNCF-affiliated community in the Hooghly region of West Bengal, empowering members through networking, education, and collaboration around containerization, microservices, and Kubernetes.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/ty9dt7j",
      },
    ],
  },
  {
    slug: "kerala",
    name: "Kerala",
    lat: 10.8505,
    lng: 76.2711,
    cities: [
      {
        slug: "kochi",
        name: "Kochi",
        lat: 9.9312,
        lng: 76.2673,
        organizer: "CNCG Kochi Team",
        description:
          "Cloud Native Computing Group Kochi drives cloud-native learning in Kerala, with a strong focus on Kubernetes, serverless, and open-source contributions from the developer community.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/h47f5ed",
      },
      {
        slug: "trivandrum",
        name: "Thiruvananthapuram",
        lat: 8.5241,
        lng: 76.9366,
        organizer: "CNCG Trivandrum Team",
        description:
          "Cloud Native Computing Group Thiruvananthapuram connects cloud-native practitioners in Kerala's capital, focusing on DevOps, CI/CD, and Kubernetes-based application delivery.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/7b3tqkv",
      },
      {
        slug: "kozhikode",
        name: "Kozhikode",
        lat: 11.2588,
        lng: 75.7804,
        organizer: "CNCG Calicut Team",
        description:
          "Cloud Native Calicut is a community-driven initiative for enthusiasts, developers, and professionals interested in cloud-native technologies in northern Kerala, fostering learning, collaboration, and growth.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/mz5nrf5",
      },
      {
        slug: "kottayam",
        name: "Kottayam",
        lat: 9.5916,
        lng: 76.5222,
        organizer: "CNCG Kottayam Team",
        description:
          "Cloud Native Kottayam is a CNCF chapter in Kerala connecting cloud-native enthusiasts, with a focus on learning, networking, and democratizing cloud-native patterns for everyone.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/e7jbcmg",
      },
      {
        slug: "thrissur",
        name: "Thrissur",
        lat: 10.5276,
        lng: 76.2144,
        organizer: "Kubernetes Kerala Team",
        description:
          "Kubernetes Kerala is a community group in Thrissur for Kubernetes and cloud-native enthusiasts, discussing the ecosystem and organizing the Cloud Native Summit Kerala.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/7zqh22z",
      },
    ],
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    lat: 27.0238,
    lng: 74.2179,
    cities: [
      {
        slug: "jaipur",
        name: "Jaipur",
        lat: 26.9124,
        lng: 75.7873,
        organizer: "CNCG Jaipur Team",
        description:
          "Cloud Native Computing Group Jaipur is Rajasthan's cloud-native hub, hosting events and learning sessions for developers in the Pink City's growing tech scene.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/7qpv9d9",
      },
      {
        slug: "bikaner",
        name: "Bikaner",
        lat: 28.0229,
        lng: 73.3119,
        organizer: "CNCG Bikaner Team",
        description:
          "Cloud Native Bikaner is an official CNCF community group bringing cloud-native technologies and Kubernetes education to the Camel City of Rajasthan.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/gdmaa88",
      },
    ],
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    lat: 26.8467,
    lng: 80.9462,
    cities: [
      {
        slug: "lucknow",
        name: "Lucknow",
        lat: 26.8467,
        lng: 80.9462,
        organizer: "CNCG Lucknow Team",
        description:
          "Cloud Native Computing Group Lucknow brings cloud-native knowledge to the heart of UP, covering Kubernetes, service mesh, and modern DevOps practices.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/abuptzq",
      },
      {
        slug: "noida",
        name: "Noida",
        lat: 28.5355,
        lng: 77.391,
        organizer: "CNCG Noida Team",
        description:
          "Cloud Native Computing Group Noida serves the booming NCR tech corridor, hosting sessions on cloud-native security, Kubernetes operations, and platform engineering.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/u7abdpk",
      },
      {
        slug: "kanpur",
        name: "Kanpur",
        lat: 26.4499,
        lng: 80.3319,
        organizer: "CNCG Kanpur Team",
        description:
          "CNCF Kanpur is a local community chapter bringing together students, developers, and professionals to learn and collaborate on Kubernetes, containers, microservices, and open-source cloud infrastructure.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/2qrf75q",
      },
    ],
  },
  {
    slug: "odisha",
    name: "Odisha",
    lat: 20.9517,
    lng: 85.0985,
    cities: [
      {
        slug: "bhubaneswar",
        name: "Bhubaneswar",
        lat: 20.2961,
        lng: 85.8245,
        organizer: "CNCG Bhubaneswar Team",
        description:
          "The CNCF Bhubaneswar chapter is a dynamic community dedicated to advancing cloud-native technologies in eastern India, hosting regular meetups, workshops, and conferences to foster collaboration, innovation, and knowledge sharing.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/gtk5ka5",
      },
    ],
  },
  {
    slug: "chandigarh",
    name: "Chandigarh",
    lat: 30.7333,
    lng: 76.7794,
    cities: [
      {
        slug: "chandigarh",
        name: "Chandigarh",
        lat: 30.7333,
        lng: 76.7794,
        organizer: "CNCG Chandigarh Team",
        description:
          "The CNCG Chandigarh Chapter educates, inspires, and empowers members to unlock the full potential of cloud-native technologies, bridging local talent with the DevOps, open-source, and cloud-native ecosystems as an official CNCF chapter.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/utpgj29",
      },
    ],
  },
  {
    slug: "uttarakhand",
    name: "Uttarakhand",
    lat: 30.0668,
    lng: 79.0193,
    cities: [
      {
        slug: "dehradun",
        name: "Dehradun",
        lat: 30.3165,
        lng: 78.0322,
        organizer: "CNCG Dehradun Team",
        description:
          "CNCF Dehradun is a cloud-native technology catalyst nestled in the beautiful hill city of Dehradun, leveraging cutting-edge technologies like Kubernetes, microservices, serverless architecture, and observability to transform software development in Uttarakhand.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/53rxx7u",
      },
    ],
  },
  {
    slug: "haryana",
    name: "Haryana",
    lat: 29.0588,
    lng: 76.0856,
    cities: [
      {
        slug: "gurugram",
        name: "Gurugram",
        lat: 28.4595,
        lng: 77.0266,
        organizer: "CNCG Gurugram Team",
        description:
          "Cloud Native Gurugram is a CNCF chapter of experts, developers, and tech enthusiasts devoted to cloud-native technologies, providing the local tech community a forum to exchange best practices, insights, and information about cloud-native technology.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/atcn6qw",
      },
    ],
  },
  {
    slug: "jharkhand",
    name: "Jharkhand",
    lat: 23.6102,
    lng: 85.2799,
    cities: [
      {
        slug: "ranchi",
        name: "Ranchi",
        lat: 23.3441,
        lng: 85.3096,
        organizer: "CNCG Ranchi Team",
        description:
          "Cloud Native Ranchi is an official CNCF chapter dedicated to bridging the gap between local talent and cloud-native ecosystems in Jharkhand, providing support and inclusive, accessible events covering Kubernetes, containers, and modern infrastructure.",
        ocGroupUrl: "https://ocgroups.dev/cncf/group/kjqzaa6",
      },
    ],
  },
];

export const STATE_SLUGS = new Set(groups.map((g) => g.slug));

export const CITY_SLUGS = new Set(
  groups.flatMap((g) => g.cities.map((c) => c.slug))
);

export function getState(slug: string): StateGroup | undefined {
  return groups.find((g) => g.slug === slug);
}

export function getCity(
  citySlug: string
): { city: CityGroup; state: StateGroup } | undefined {
  for (const state of groups) {
    const city = state.cities.find((c) => c.slug === citySlug);
    if (city) return { city, state };
  }
  return undefined;
}
