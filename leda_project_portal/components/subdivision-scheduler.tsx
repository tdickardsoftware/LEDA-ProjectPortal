import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface SubdivisionSchedulerProps {
  teams: Record<string, { teamId: string; placeId: string; teamName: string }>;
  gameDates: Record<string, string>;
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
    <div className="rounded-md border shadow-sm">
        <div className="overflow-auto">
            <Table className="table-auto">
                <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead className="font-semibold border-r border-gray-300 text-left py-4 px-6">Team Name</TableHead>
                {gameDateEntries.map(([gameTitle, date], index) => (
                    <TableHead 
                      key={gameTitle} 
                      className={`whitespace-nowrap text-center py-4 px-6 ${index < gameDateEntries.length - 1 ? 'border-r border-gray-300' : ''}`}
                    >
                        <div className="font-medium text-sm">
                            {gameTitle.replace(/(\d+)/, ' $1')} 
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {date}
                        </div>
                    </TableHead>
                ))}
                </TableRow>
                </TableHeader>
                <TableBody>
                {teamEntries.map(([key, teamData], rowIndex) => (
                <TableRow key={key} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                    <TableCell className="font-medium w-fit border-r border-gray-200">{`${key} - ${teamData.teamName}`}</TableCell>
                    {gameDateEntries.map(([gameTitle], index) => (
                    <TableCell 
                      key={`${key}-${gameTitle}`} 
                      className={`whitespace-nowrap py-4 px-6 ${index < gameDateEntries.length - 1 ? 'border-r border-gray-300' : ''}`}
                    >
                        <div className="flex items-center justify-center">
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="border border-dashed border-gray-300 rounded-md h-9 w-9 p-0 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                              onClick={() => handleAddMatchup(teamData.teamId, gameTitle)}
                              title={`Add matchup for ${teamData.teamName}`}
                            >
                                <Plus className="h-4 w-4" />
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
