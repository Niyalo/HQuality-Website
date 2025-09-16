// types/index.ts

// The shape of an expanded Agent reference
export interface AgentInfo {
  _id: string; // Note: Sanity returns _id on expanded references
  firstname: string;
  lastname: string;
}

// The shape of an expanded Client reference
export interface ClientInfo {
  _id: string;
  first_name: string;
  last_name: string;
}

// The main Property interface that reflects your GROQ query
export interface Property {
  _id: string;
  address: string;
  price: number;
  square_footage: number;
  built_in: string;
  property_id: number;
  agent?: AgentInfo; // Uses the expanded AgentInfo type
  clients?: ClientInfo[]; // Uses an array of the expanded ClientInfo type
  property_img?: { asset: { url: string } }[];
}