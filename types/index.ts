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

export interface ClientContract {
  _key: string;
  title: string;
  file: {
    asset: {
      _ref: string;
      url: string;
    }
  }
}

export interface Client {
  _id: string;
  first_name: string;
  last_name: string;
  contact?: number;
  email: string;
  address: string;
  user_img?: { asset?: { url?: string } };
  agent?: AgentInfo; // Uses the expanded AgentInfo type
  contracts?: ClientContract[]; // Uses an array of the expanded Contract type
}