import type { EntitySpec, TestCaseSpec } from "../../types/index.js";

export class TestUmEmitter {
  emit(entity: EntitySpec): string {
    const propertyBlocks = entity.properties
      .map((property) => {
        const cases = property.tests.flatMap((test) => test.cases);
        return `  property ${property.name} {
${cases.map((testCase) => this.emitCase(testCase)).join("\n")}
  }`;
      })
      .join("\n\n");

    return `test ${entity.name} {
  target entity ${entity.name}

${propertyBlocks}
}`;
  }

  private emitCase(testCase: TestCaseSpec): string {
    if (testCase.kind === "positive") {
      return `    positive ${testCase.name}`;
    }
    if (testCase.kind === "healing") {
      return `    healing ${testCase.name} expects ${testCase.expects}`;
    }
    return `    negative ${testCase.name} expects ${testCase.expects}`;
  }
}
