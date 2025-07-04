# Simple phase2 setup coordination

## Coordinator

Prepare your initial directory structure, you need the phase1 ptau file, your circuit r1cs and initial zkey files. They need to be in a directory as following:

```
workspace
├── contributions
│   └── 0000
│       ├── circuit1.zkey
│       └── circuit2.zkey
├── phase1.ptau
└── r1cs
    ├── circuit1.r1cs
    └── circuit2.r1cs
```

Build the coordinator OCI container in `coordinator/Dockerfile`, eg. with Docker:

``` sh
docker build -t coordinator . # Build container image with name 'coordinator'
```

The container expects the ceremony folder to be mounted to `/workspace` whenever it is run.

Perform initial setup and verification:

```sh
docker run \
--rm \ # Clean up container after run
-it \ # Run interactive with tty
-v ${PWD}:/workspace \ # Mount current directory to /workspace in container
coordinator \ # Container image name, change if you've built it with a different name
init # Command
```

Send challenge to contributor:

```sh
docker run \
--rm \ # Clean up container after run
-it \ # Run interactive with tty
-v ${PWD}:/workspace \ # Mount current directory to /workspace in container
coordinator \ # Container image name, change if you've built it with a different name
send # Command
```

It will output a challenge code (`xx-xxxxxx-xxxxxx` in the example output), send the challenge code to the contributor.

Example output:
```sh
SEND WORMHOLE CHALLENGE CODE TO CONTRIBUTOR:

Building zipfile..
Sending directory (10 MB compressed) named '0000'
Wormhole code is: xx-xxxxxx-xxxxxx
On the other computer, please run:

wormhole receive xx-xxxxxx-xxxxxx
```

When the contributor has finished their contribution, run the recieve command to recieve and verify their contribution.

```sh
docker run \
--rm \ # Clean up container after run
-it \ # Run interactive with tty
-v ${PWD}:/workspace \ # Mount current directory to /workspace in container
coordinator \ # Container image name, change if you've built it with a different name
receieve # Command
```

Enter contributor's response code:
```sh
Enter response code:
```

Repeat for each contributor.

## Contributors

Run the contribution container with:

```sh
docker run --rm -it <OCI repository>/contributor
```

Enter the challenge code given to you by your coordinator when you see:
```sh
Enter challenge code:
```

Enter a name that your contribution will be known under, this does not have to be your real name
```sh
Enter your name or alias:
```

Enter some entropy when you see the following, you can mash your keyboard or use some other source of randomness:
```sh
Enter some random text:
```

Wait for your contribution to complete

Save your contribution transcript hash, you can post this on eg. Twitter, Lens to attest to your contribution on completion of the ceremony. Consult your coordinator if you have questions. It will look like:

```sh
Transcript hash, SAVE THIS VALUE:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  /workspace/response/transcript.json
You can share or publish this value for people to verify your contribution to the ceremony
```

Send your response code back to the coordinator alond with your transcript hash, it will look like:

```sh
SEND WORMHOLE RESPONSE CODE TO COORDINATOR

Building zipfile..
Sending directory (10 MB compressed) named 'response'
Wormhole code is: xx-xxxxxx-xxxxxx
On the other computer, please run:

wormhole receive xx-xxxxxx-xxxxxx
```

Your coordinator will verify your contribution.

## Exporting and Formatting

The final fomat will differ depending on the usecase for your circuits, included in this repo is an example export script that calculates per-circuit IPFS folders. You will need to fork and edit it to suit your needs.

Build the coordinator OCI container in `exporter-example/Dockerfile`, eg. with Docker:

``` sh
docker build -t exporter . # Build container image with name 'exporter'
```

Export the results of the ceremony with:

```sh
docker run \
--rm \ # Clean up container after run
-it \ # Run interactive with tty
-v ${PWD}:/workspace \ # Mount current directory to /workspace in container
exporter \ # Container image name, change if you've built it with a different name
export # Command
```

Enter the beacon hash you're using for the ceremony (in hex, no leading 0x), this will usually be a block hash of some pre-determined block:

```
Enter beacon hash:
```

You will end up with a finalized ceremony workspace that looks like:

```
workspace
├── contributions
│   ├── 0000
│   │   ├── circuit1.zkey
│   │   └── circuit2.zkey
⋮   ⋮
⋮   ⋮
│   └── XXXX
│       ├── circuit1.zkey
│       ├── circuit2.zkey
│       └── transcript.json
├── export
│   ├── circuits
│   │   ├── circuit1
│   │   │   ├── r1cs.br
│   │   │   ├── vkey.json
│   │   │   └── zkey.br
│   │   └── circuit2
│   │       ├── r1cs.br
│   │       ├── vkey.json
│   │       └── zkey.br
│   └── transcripts
│       ├── 0000.json
⋮       ⋮
⋮       ⋮
│       ├── XXXX.json
│       └── log.json
├── log.json
├── phase1.ptau
└── r1cs
    ├── circuit1.r1cs
    └── circuit2.r1cs
```

Calculate the IPFS hash of artifacts

```sh
docker run \
--rm \ # Clean up container after run
-it \ # Run interactive with tty
-v ${PWD}:/workspace \ # Mount current directory to /workspace in container
exporter \ # Container image name, change if you've built it with a different name
ipfs # Command
```

You can now pin the export folder to IPFS to store both individual circuit artifacts and the ceremony output.
