import { NS } from '@ns'

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    const scriptToDeploy = 'yxautomate.js'; // Script to deploy
    // Get all servers including sub-servers
    const servers = getAllServers(ns);
    for (const server of servers) {
        if (ns.hasRootAccess(server)) {
            // Kill all scripts running on the server
            ns.killall(server);
            ns.print(`Killed all scripts on ${server}`);

            // Deploy the script to the server
            await ns.scp(scriptToDeploy, server);
            // Execute the script on the server
            const threads = Math.floor(ns.getServerMaxRam(server) / ns.getScriptRam(scriptToDeploy));
            if (threads > 0) {
                ns.exec(scriptToDeploy, server, threads);
                ns.print(`Deployed and started ${scriptToDeploy} on ${server}`);
            } else {
                ns.print(`Not enough RAM on ${server} to run ${scriptToDeploy}`);
            }
        }
    }
}

// Function to get all servers, including sub-servers
function getAllServers(ns: NS): string[] {
    const servers = new Set<string>();
    const toScan = ['home'];
    while (toScan.length > 0) {
        const server = toScan.pop()!;
        const connections = ns.scan(server);
        for (const connection of connections) {
            if (!servers.has(connection) && connection !== 'home' && connection !== 'darkweb') {
                servers.add(connection);
                toScan.push(connection);
            }
        }
    }
    return Array.from(servers);
}
