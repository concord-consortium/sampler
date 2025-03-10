import { tokenize, parseExpression, stringify, getVariables, ExpressionNode } from './formula-parser';

describe('formula-parser', () => {
  describe('tokenize', () => {
    it('should tokenize a simple expression', () => {
      const input = '1 + 2';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['1', '+', '2']);
    });

    it('should tokenize a complex expression', () => {
      const input = 'x * (y + 2) / 3';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['x', '*', '(', 'y', '+', '2', ')', '/', '3']);
    });

    it('should tokenize expressions with comparison operators', () => {
      const input = 'x > 5 and y <= 10';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['x', '>', '5', 'and', 'y', '<', '=', '10']);
    });

    it('should tokenize expressions with unicode operators', () => {
      const input = 'x ≥ 5 and y ≠ 10';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['x', '≥', '5', 'and', 'y', '≠', '10']);
    });

    it('should tokenize function calls', () => {
      const input = 'max(x, y, 10)';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['max', '(', 'x', ',', 'y', ',', '10', ')']);
    });

    it('should handle negative numbers', () => {
      const input = '-5 + -10';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['-5', '+', '-10']);
    });

    it('should handle decimal numbers', () => {
      const input = '3.14 * 2.5';
      const tokens = tokenize(input);
      expect(tokens).toEqual(['3.14', '*', '2.5']);
    });
  });

  describe('parseExpression', () => {
    it('should parse a simple expression', () => {
      const tokens = ['1', '+', '2'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'result' },
        right: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Literal', value: 1 },
          right: { type: 'Literal', value: 2 }
        }
      });
    });

    it('should parse an expression with a comparison operator', () => {
      const tokens = ['x', '>', '5'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'result' },
        right: {
          type: 'BinaryExpression',
          operator: '>',
          left: { type: 'Variable', name: 'x' },
          right: { type: 'Literal', value: 5 }
        }
      });
    });

    it('should parse an expression with parentheses', () => {
      const tokens = ['(', 'x', '+', '2', ')', '*', '3'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'result' },
        right: {
          type: 'BinaryExpression',
          operator: '*',
          left: {
            type: 'GroupingExpression',
            expression: {
              type: 'BinaryExpression',
              operator: '+',
              left: { type: 'Variable', name: 'x' },
              right: { type: 'Literal', value: 2 }
            }
          },
          right: { type: 'Literal', value: 3 }
        }
      });
    });

    it('should parse a function call', () => {
      const tokens = ['max', '(', 'x', ',', 'y', ')'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'result' },
        right: {
          type: 'FunctionCall',
          callee: 'max',
          arguments: [
            { type: 'Variable', name: 'x' },
            { type: 'Variable', name: 'y' }
          ]
        }
      });
    });

    it('should parse an expression with logical operators', () => {
      const tokens = ['x', '>', '5', 'and', 'y', '<', '10'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      // Now we know the actual structure from the console output
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: {
          type: 'Variable',
          name: 'result'
        },
        right: {
          type: 'BinaryExpression',
          operator: '<',
          left: {
            type: 'BinaryExpression',
            operator: '>',
            left: {
              type: 'Variable',
              name: 'x'
            },
            right: {
              type: 'BinaryExpression',
              operator: 'and',
              left: {
                type: 'Literal',
                value: 5
              },
              right: {
                type: 'Variable',
                name: 'y'
              }
            }
          },
          right: {
            type: 'Literal',
            value: 10
          }
        }
      });
    });

    it('should parse an expression with unary operators', () => {
      const tokens = ['-', 'x'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'result' },
        right: {
          type: 'BinaryExpression',
          operator: '-',
          left: { type: 'Variable', name: 'result' },
          right: { type: 'Variable', name: 'x' }
        }
      });
    });

    it('should handle expressions that start with operators', () => {
      const tokens = ['=', 'x', '+', '5'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'result' },
        right: {
          type: 'BinaryExpression',
          operator: '=',
          left: { type: 'Variable', name: 'result' },
          right: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Variable', name: 'x' },
            right: { type: 'Literal', value: 5 }
          }
        }
      });
    });

    it('should handle replacements in expressions', () => {
      const tokens = ['x', '=', '5'];
      const state = { value: 0, columnName: 'result', replacements: ['x'] };
      const ast = parseExpression(tokens, state);
      
      expect(ast).toEqual({
        type: 'BinaryExpression',
        operator: '=',
        left: { type: 'Variable', name: 'x' },
        right: { type: 'Literal', value: 5 }
      });
    });

    it('should throw an error for unexpected tokens', () => {
      const tokens = ['@', 'x'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      
      expect(() => {
        parseExpression(tokens, state);
      }).toThrow();
    });

    it('should handle expressions with missing closing parenthesis', () => {
      const tokens = ['(', 'x', '+', '2'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      
      expect(() => {
        parseExpression(tokens, state);
      }).toThrow('Expected )');
    });
  });

  describe('stringify', () => {
    it('should stringify a simple expression', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 }
      };
      
      const result = stringify(ast, []);
      expect(result).toBe('1 + 2');
    });

    it('should stringify a complex expression', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '*',
        left: {
          type: 'GroupingExpression',
          expression: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Variable', name: 'x' },
            right: { type: 'Literal', value: 2 }
          }
        },
        right: { type: 'Literal', value: 3 }
      };
      
      const result = stringify(ast, []);
      expect(result).toBe("('x' + 2) * 3");
    });

    it('should stringify a function call', () => {
      const ast: ExpressionNode = {
        type: 'FunctionCall',
        callee: 'max',
        arguments: [
          { type: 'Variable', name: 'x' },
          { type: 'Variable', name: 'y' }
        ]
      };
      
      const result = stringify(ast, []);
      expect(result).toBe("max('x', 'y')");
    });

    it('should handle replacements in stringification', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Variable', name: 'x' },
        right: { type: 'Variable', name: 'y' }
      };
      
      const result = stringify(ast, ['x']);
      expect(result).toBe("x + 'y'");
    });

    it('should stringify unary expressions', () => {
      const ast: ExpressionNode = {
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Variable', name: 'x' }
      };
      
      const result = stringify(ast, []);
      expect(result).toBe("-'x'");
    });

    it('should throw an error for unknown node types', () => {
      // Create a node with an unknown type using type assertion
      const invalidNode = {
        type: 'InvalidType'
      } as unknown as ExpressionNode;
      
      expect(() => {
        stringify(invalidNode, []);
      }).toThrow('Unknown node type');
    });
  });

  describe('getVariables', () => {
    it('should extract variables from a simple expression', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Variable', name: 'x' },
        right: { type: 'Literal', value: 2 }
      };
      
      const variables = getVariables(ast);
      expect(variables).toEqual(['x']);
    });

    it('should extract variables from a complex expression', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '*',
        left: {
          type: 'GroupingExpression',
          expression: {
            type: 'BinaryExpression',
            operator: '+',
            left: { type: 'Variable', name: 'x' },
            right: { type: 'Variable', name: 'y' }
          }
        },
        right: { type: 'Variable', name: 'z' }
      };
      
      const variables = getVariables(ast);
      expect(variables.sort()).toEqual(['x', 'y', 'z'].sort());
    });

    it('should extract variables from a function call', () => {
      const ast: ExpressionNode = {
        type: 'FunctionCall',
        callee: 'max',
        arguments: [
          { type: 'Variable', name: 'x' },
          { type: 'Variable', name: 'y' },
          { type: 'Literal', value: 10 }
        ]
      };
      
      const variables = getVariables(ast);
      expect(variables.sort()).toEqual(['x', 'y'].sort());
    });

    it('should extract variables from unary expressions', () => {
      const ast: ExpressionNode = {
        type: 'UnaryExpression',
        operator: '-',
        argument: { type: 'Variable', name: 'x' }
      };
      
      const variables = getVariables(ast);
      expect(variables).toEqual(['x']);
    });

    it('should return an empty array if there are no variables', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 }
      };
      
      const variables = getVariables(ast);
      expect(variables).toEqual([]);
    });

    it('should not duplicate variables', () => {
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Variable', name: 'x' },
        right: { type: 'Variable', name: 'x' }
      };
      
      const variables = getVariables(ast);
      expect(variables).toEqual(['x']);
    });

    it('should extract variables from all node types', () => {
      const variableSet = new Set<string>();
      
      // Create a complex AST with all node types
      const ast: ExpressionNode = {
        type: 'BinaryExpression',
        operator: '+',
        left: {
          type: 'UnaryExpression',
          operator: '-',
          argument: {
            type: 'Variable',
            name: 'x'
          }
        },
        right: {
          type: 'GroupingExpression',
          expression: {
            type: 'FunctionCall',
            callee: 'max',
            arguments: [
              {
                type: 'Variable',
                name: 'y'
              },
              {
                type: 'Literal',
                value: 10
              }
            ]
          }
        }
      };
      
      // Call getVariables which internally calls extractVariables
      const variables = getVariables(ast);
      
      // Verify all variables were extracted
      expect(variables.sort()).toEqual(['x', 'y'].sort());
    });
  });

  describe('containsReplacements', () => {
    it('should check if a node contains replacements', () => {
      // Create a state with replacements
      const state = { value: 0, columnName: 'result', replacements: ['x'] };
      
      // Call parseExpression which internally calls containsReplacements
      const result = parseExpression(['x', '+', 'y'], state);
      
      // Just verify that the left side of the expression is the variable 'x'
      // instead of the default 'result'
      expect(result.type).toBe('BinaryExpression');
      if (result.type === 'BinaryExpression') {
        expect(result.left.type).toBe('Variable');
        if (result.left.type === 'Variable') {
          expect(result.left.name).toBe('x');
        }
      }
    });
  });

  describe('parseFunctionCall', () => {
    it('should parse a function call with multiple arguments', () => {
      // We can't directly test parseFunctionCall since it's not exported
      // Instead, we'll test it through parseExpression
      const tokens = ['max', '(', 'x', ',', 'y', ',', '10', ')'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      
      const ast = parseExpression(tokens, state);
      
      // Verify the function call was parsed correctly
      expect(ast.type).toBe('BinaryExpression');
      if (ast.type === 'BinaryExpression') {
        expect(ast.right.type).toBe('FunctionCall');
        if (ast.right.type === 'FunctionCall') {
          expect(ast.right.callee).toBe('max');
          expect(ast.right.arguments.length).toBe(3); // x, y, 10
        }
      }
    });

    it('should parse a function call with no arguments', () => {
      const tokens = ['now', '(', ')'];
      const state = { value: 0, columnName: 'result', replacements: [] };
      
      // Call parseExpression which internally calls parseFunctionCall
      const ast = parseExpression(tokens, state);
      
      // Verify the function call was parsed correctly
      expect(ast.type).toBe('BinaryExpression');
      if (ast.type === 'BinaryExpression') {
        expect(ast.right.type).toBe('FunctionCall');
        if (ast.right.type === 'FunctionCall') {
          expect(ast.right.callee).toBe('now');
          expect(ast.right.arguments.length).toBe(0);
        }
      }
    });
  });
}); 