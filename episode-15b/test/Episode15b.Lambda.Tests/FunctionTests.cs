using Xunit;
using Amazon.Lambda.TestUtilities;
using Episode15b.Lambda;

namespace Episode15b.Lambda.Tests;

public class FunctionTests
{
    [Fact]
    public void TestToUpperFunction()
    {
        // Arrange
        var function = new Function();
        var context = new TestLambdaContext();
        var upperCase = "hello world";

        // Act
        var result = function.FunctionHandler(upperCase, context);

        // Assert
        Assert.Equal("HELLO WORLD", result);
    }
}