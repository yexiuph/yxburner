import { NS } from '@ns'

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
    ns.tprint("Starting YXBurner...");

    ns.tprint("Starting to deploy automated hacking to other servers");
    const scriptToDeploy = 'yxdeploy.js';
    await ns.exec(scriptToDeploy, 'home');
    ns.tprint("Deployed automated hacking to the other servers");

    ns.tprint("Starting to scan and hack available servers");
    while (true) {
        // Scan and filter targets sequentially
        const targets: string[] = ns.scan().filter(target =>
            target !== "home" && target !== "darkweb" &&
            ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()
        );

        for (const target of targets) {
            await scannedTargets(ns, target);
        }

        // Sleep for a short period before scanning again to avoid overwhelming the game
        await ns.sleep(1000);
    }
}

export async function scannedTargets(ns: NS, target: string): Promise<void> {
    // Skip if the server is 'home' or 'darkweb'
    if (target === "home" || target === "darkweb") {
        ns.print(`Skipping ${target}`);
        return;
    }

    // Check if we can hack this server
    if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
        // Attempt to gain root access using available programs
        if (!ns.hasRootAccess(target)) {
            const tools = [
                { file: "BruteSSH.exe", method: ns.brutessh },
                { file: "FTPCrack.exe", method: ns.ftpcrack },
                { file: "relaySMTP.exe", method: ns.relaysmtp },
                { file: "HTTPWorm.exe", method: ns.httpworm },
                { file: "SQLInject.exe", method: ns.sqlinject }
            ];

            for (const tool of tools) {
                if (ns.fileExists(tool.file, "home")) {
                    tool.method(target);
                    // Sleep to ensure that the previous action is processed
                    await ns.sleep(500);
                }
            }

            // If we have opened enough ports, we can nuke the server
            const portsRequired = ns.getServerNumPortsRequired(target);
            if (ns.getServer(target).openPortCount >= portsRequired) {
                ns.nuke(target);
                ns.print(`Gained root access to ${target}`);
            }
        }

        // If we have root access, perform weaken, grow, and hack operations
        if (ns.hasRootAccess(target)) {
            const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
            const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

            // Get server status once to avoid multiple calls
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

            ns.print(`Hacking ${target}.`);
            await ns.hack(target);
        }
    } else {
        // If we have root access, perform weaken, grow, and hack operations
        if (ns.hasRootAccess(target)) {
            const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
            const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

            // Get server status once to avoid multiple calls
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
        }
        ns.print(`Weakening the target if we have root access so we can hack it later. 3:D`);
    }
}
