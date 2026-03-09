import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const networks = await docker.listNetworks();
        const containers = await docker.listContainers({ all: true });

        // Count containers per network
        const networkContainerCounts: Record<string, number> = {};

        containers.forEach(container => {
            if (container.NetworkSettings && container.NetworkSettings.Networks) {
                Object.values(container.NetworkSettings.Networks).forEach((net: any) => {
                    if (net.NetworkID) {
                        networkContainerCounts[net.NetworkID] = (networkContainerCounts[net.NetworkID] || 0) + 1;
                    }
                });
            }
        });

        // Add container count to each network for better overview
        const formattedNetworks = networks.map(net => {
            const containersCount = networkContainerCounts[net.Id] || 0;
            return {
                Id: net.Id,
                Name: net.Name,
                Driver: net.Driver,
                Scope: net.Scope,
                Created: net.Created || '',
                ContainersCount: containersCount
            };
        });

        // Sort by name
        formattedNetworks.sort((a, b) => a.Name.localeCompare(b.Name));

        return NextResponse.json(formattedNetworks);
    } catch (error: any) {
        console.error('Failed to fetch networks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Name, Driver, Subnet, Gateway, IPRange, EnableIPv6, IPv6Subnet, IPv6Gateway } = body;

        if (!Name) {
            return NextResponse.json({ error: 'Network name is required' }, { status: 400 });
        }

        const createOptions: any = {
            Name,
            Driver: Driver || 'bridge',
            EnableIPv6: EnableIPv6 === true,
        };

        const ipamConfigs = [];

        // Add IPv4 Config
        if (Subnet || Gateway || IPRange) {
            const ipv4Config: any = {};
            if (Subnet) ipv4Config.Subnet = Subnet;
            if (Gateway) ipv4Config.Gateway = Gateway;
            if (IPRange) ipv4Config.IPRange = IPRange;
            ipamConfigs.push(ipv4Config);
        }

        // Add IPv6 Config
        if (IPv6Subnet || IPv6Gateway) {
            const ipv6Config: any = {};
            if (IPv6Subnet) ipv6Config.Subnet = IPv6Subnet;
            if (IPv6Gateway) ipv6Config.Gateway = IPv6Gateway;
            ipamConfigs.push(ipv6Config);
        }

        if (ipamConfigs.length > 0) {
            createOptions.IPAM = {
                Config: ipamConfigs
            };
        }

        const network = await docker.createNetwork(createOptions);

        return NextResponse.json({ success: true, id: network.id });
    } catch (error: any) {
        console.error('Failed to create network:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
