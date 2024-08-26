import { NS } from '@ns'

// Define a global Set to keep track of discovered servers
const discoveredServers = new Set<string>();

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    while (true) {
        // Clear the discovered servers set at the beginning of each iteration
        discoveredServers.clear();

        // Start scanning from the home server
        await scanServers(ns, "home");

        // Perform operations on all servers where root access is gained
        for (const target of discoveredServers) {
            await performHackingOperations(ns, target);
        }

        // Sleep for a short period before the next iteration to avoid overwhelming the game
        await ns.sleep(5000); // Sleep for 5 seconds
    }
}

// Function to recursively scan servers and collect hackable ones
export async function scanServers(ns: NS, server: string) : Promise<void> {
    const serversToScan = ns.scan(server);

    for (const target of serversToScan) {
        if (!discoveredServers.has(target) && target !== "home" && target !== "darkweb") {
            discoveredServers.add(target);

            // Recursively scan connected servers
            await scanServers(ns, target);
        }
    }
}

// Perform grow, weaken, and hack operations on servers where root access is already gained
export async function performHackingOperations(ns: NS, target: string) : Promise<void> {
    if (ns.hasRootAccess(target)) {
        // Check thresholds for grow, weaken, and hack
        const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
        const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
        const serverSecurity = ns.getServerSecurityLevel(target);
        const serverMoney = ns.getServerMoneyAvailable(target);

        // Priority order: Weakening -> Growing -> Hacking
        if (serverSecurity > securityThresh) {
            ns.print(`Weakening ${target} to lower its security level.`);
            await ns.weaken(target);
            return; // After weakening, re-evaluate the server
        }

        if (serverMoney < moneyThresh) {
            ns.print(`Growing ${target} to increase its money available.`);
            await ns.grow(target);
            return; // After growing, re-evaluate the server
        }

        // Check if the server is hackable
        if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
            ns.print(`Hackable server found: ${target}`);
            ns.print(`Hacking ${target}.`);
            await ns.hack(target);
        }

        // Optionally, you can put a delay here to avoid rapid reprocessing of the same server
        await ns.sleep(500);
    }
}
