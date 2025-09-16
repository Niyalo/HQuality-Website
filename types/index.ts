// The shape of an expanded Agent reference from a GROQ query
export interface AgentInfo {
  _id: string;
  firstname: string;
  lastname: string;
}

// The shape of an expanded Client reference from a GROQ query
export interface ClientInfo {
  _id: string;
  first_name: string;
  last_name: string;
}

// The main Property interface that reflects your complete GROQ query
export interface Property {
  _id: string;
  address: string;
  price: number;
  square_footage: number;
  built_in: string;
  property_id: number;
  agent?: AgentInfo;
  clients?: ClientInfo[];
  property_img?: { asset: { url: string } }[];
}