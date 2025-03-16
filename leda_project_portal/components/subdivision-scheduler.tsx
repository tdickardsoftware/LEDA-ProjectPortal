import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface SubdivisionSchedulerProps {
  teams: Record<string, { teamId: string; placeId: string; teamName: string }>; // Format: { "Team ID": { teamId, placeId, teamName }, ... }
  gameDates: Record<string, string>; // Format: { "GameTitle": "Date" }
}

export function SubdivisionScheduler({ teams, gameDates }: SubdivisionSchedulerProps) {
  // Convert teams object to array for mapping
  const teamEntries = Object.entries(teams);
  
  // Convert gameDates object to array for mapping
  const gameDateEntries = Object.entries(gameDates);

  const handleAddMatchup = (teamId: string, gameTitle: string) => {
    console.log(`Add matchup for team ${teamId} in game ${gameTitle}`);
  }
  return (
    <div className="rounded-md border">
        <div className="overflow-auto">
            <Table className="table-auto">
                <TableHeader>
                <TableRow>
                <TableHead className="font-medium border-r border-gray-200">Team Name</TableHead>
                {gameDateEntries.map(([gameTitle, date], index) => (
                    <TableHead 
                      key={gameTitle} 
                      className={`whitespace-nowrap ${index < gameDateEntries.length - 1 ? 'border-r border-gray-200' : ''}`}
                    >
                        <div>
                            {gameTitle.replace(/(\d+)/, ' $1')} 
                        </div>
                        <div>
                            {date}
                        </div>
                    </TableHead>
                ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {teamEntries.map(([key, teamData]) => (
                <TableRow key={key}>
                    <TableCell className="font-medium w-fit border-r border-gray-200">{`${key} - ${teamData.teamName}`}</TableCell>
                    {gameDateEntries.map(([gameTitle], index) => (
                    <TableCell 
                      key={`${key}-${gameTitle}`} 
                      className={`whitespace-nowrap ${index < gameDateEntries.length - 1 ? 'border-r border-gray-200' : ''}`}
                    >
                        <div className="flex items-center justify-center">
                            <Button 
                              className="border border-dashed border-gray-300 rounded-md p-3 w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                              onClick={() => handleAddMatchup(teamData.teamId, gameTitle)}
                            >
                                <Plus className="h-5 w-5 text-gray-400" />
                            </Button>
                        </div>
                    </TableCell>
                    ))}
                </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
