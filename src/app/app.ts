import { Cluster, Worker } from 'cluster'
import { cpus } from 'os'

import { createLogger } from '../factories/logger-factory'
import { IRunnable } from '../@types/base'
import { ISettings } from '../@types/settings'
import packageJson from '../../package.json'
import { Serializable } from 'child_process'

const debug = createLogger('app-primary')

export class App implements IRunnable {
  public constructor(
    private readonly process: NodeJS.Process,
    private readonly cluster: Cluster,
    private readonly settingsFactory: () => ISettings,
  ) {
    debug('starting')

    this.cluster
      .on('message', this.onClusterMessage.bind(this))
      .on('exit', this.onClusterExit.bind(this))

    this.process
      .on('SIGTERM', this.onExit.bind(this))

    debug('started')
  }

  public run(): void {
    console.log(`
 ███▄    █  ▒█████    ██████ ▄▄▄█████▓ ██▀███  ▓█████ ▄▄▄       ███▄ ▄███▓
 ██ ▀█   █ ▒██▒  ██▒▒██    ▒ ▓  ██▒ ▓▒▓██ ▒ ██▒▓█   ▀▒████▄    ▓██▒▀█▀ ██▒
▓██  ▀█ ██▒▒██░  ██▒░ ▓██▄   ▒ ▓██░ ▒░▓██ ░▄█ ▒▒███  ▒██  ▀█▄  ▓██    ▓██░
▓██▒  ▐▌██▒▒██   ██░  ▒   ██▒░ ▓██▓ ░ ▒██▀▀█▄  ▒▓█  ▄░██▄▄▄▄██ ▒██    ▒██
▒██░   ▓██░░ ████▓▒░▒██████▒▒  ▒██▒ ░ ░██▓ ▒██▒░▒████▒▓█   ▓██▒▒██▒   ░██▒
░ ▒░   ▒ ▒ ░ ▒░▒░▒░ ▒ ▒▓▒ ▒ ░  ▒ ░░   ░ ▒▓ ░▒▓░░░ ▒░ ░▒▒   ▓▒█░░ ▒░   ░  ░
░ ░░   ░ ▒░  ░ ▒ ▒░ ░ ░▒  ░ ░    ░      ░▒ ░ ▒░ ░ ░  ░ ▒   ▒▒ ░░  ░      ░
   ░   ░ ░ ░ ░ ░ ▒  ░  ░  ░    ░        ░░   ░    ░    ░   ▒   ░      ░
         ░     ░ ░        ░              ░        ░  ░     ░  ░       ░`)
    const width = 74
    const logCentered = (input: string, width: number) => {
      const start = (width >> 1) - (input.length >> 1)
      console.log(' '.repeat(start), input)
    }
    logCentered(`v${packageJson.version} by Cameri`, width)
    logCentered(`NIPs implemented: ${packageJson.supportedNips}`, width)

    const workerCount = process.env.WORKER_COUNT
      ? Number(process.env.WORKER_COUNT)
      : this.settingsFactory().workers?.count || cpus().length

    for (let i = 0; i < workerCount; i++) {
      debug('starting worker')
      this.cluster.fork()
    }

    logCentered(`${workerCount} workers started`, width)

    debug('settings: %O', this.settingsFactory())
  }

  private onClusterMessage(source: Worker, message: Serializable) {
    debug('message received from worker %s: %o', source.process.pid, message)
    for (const worker of Object.values(this.cluster.workers)) {
      if (source.id === worker.id) {
        continue
      }

      debug('sending message to worker %s: %o', worker.process.pid, message)
      worker.send(message)
    }
  }

  private onClusterExit(deadWorker: Worker, code: number, signal: string)  {
    debug('worker %s died', deadWorker.process.pid)
    if (code === 0 || signal === 'SIGINT') {
      return
    }
    debug('starting worker')
    const newWorker = this.cluster.fork()
    debug('started worker %s', newWorker.process.pid)
  }

  private onExit() {
    console.log('exiting')
    this.process.exit(0)
  }
}