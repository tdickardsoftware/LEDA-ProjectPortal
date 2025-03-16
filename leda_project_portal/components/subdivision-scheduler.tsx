import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SubdivisionSchedulerProps {
  teams: Record<string, { teamId: string; placeId: string; teamName: string }>; // Format: { "Team ID": { teamId, placeId, teamName }, ... }
  gameDates: Record<string, string>; // Format: { "GameTitle": "Date" }
}

export function SubdivisionScheduler({ teams, gameDates }: SubdivisionSchedulerProps) {
  // Convert teams object to array for mapping
  const teamEntries = Object.entries(teams);
  
  // Convert gameDates object to array for mapping
  const gameDateEntries = Object.entries(gameDates);
  
  return (
    <div className="rounded-md border">
        <div className="overflow-auto">
            <Table className="table-auto">
                <TableHeader>
                <TableRow>
                <TableHead className="font-medium">Team Name</TableHead>
                {gameDateEntries.map(([gameTitle, date]) => (
                    <TableHead key={gameTitle} className="whitespace-nowrap">
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
                    <TableCell className="font-medium w-fit">{`${key} - ${teamData.teamName}`}</TableCell>
                    {gameDateEntries.map(([gameTitle]) => (
                    <TableCell key={`${key}-${gameTitle}`} className="whitespace-nowrap">
                    {/* Game information can be displayed here */}
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
