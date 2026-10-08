import { View } from 'react-native';
import { AgentCard, Body, Heading, Page, s } from '../../components/UI';
import { agents } from '../../data/agents';
export default function Team() { return <Page><Heading>Your AI team</Heading><Body>Choose who to talk to. Each teammate keeps its own conversation.</Body><AgentCard agent={agents[0]} /><View style={s.grid}>{agents.slice(1).map(agent => <View key={agent.id} style={s.tile}><AgentCard agent={agent} compact /></View>)}</View></Page>; }
