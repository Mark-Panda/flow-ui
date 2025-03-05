import type LogicFlow from '@logicflow/core';
import registerStart from './start';
import registerLog from './log';
import registerAssignment from './assignment';
import registerDecision from './decision';
import registerStartParallel from './startParallel';
import registerEndParallel from './endParallel';

export default function registerNodes(lf: LogicFlow) {
  registerStart(lf);
  registerLog(lf);
  registerAssignment(lf);
  registerDecision(lf);
  registerStartParallel(lf);
  registerEndParallel(lf);
} 