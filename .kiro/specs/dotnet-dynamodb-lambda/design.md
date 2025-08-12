# Design Document

## Overview

The episode-15b application will be a .NET-based serverless solution demonstrating AWS Lambda integration with DynamoDB. The solution will use AWS CDK for infrastructure as code, following the patterns established in previous episodes but adapted for .NET runtime. The application will showcase modern .NET development practices for serverless computing on AWS.

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AWS CDK       │───▶│  Lambda Function │───▶│   DynamoDB      │
│ (Infrastructure)│    │    (.NET 8)      │    │     Table       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   CloudWatch     │
                       │     Logs         │
                       └──────────────────┘
```

### Technology Stack
- **Runtime**: .NET 9 (AWS Lambda supported)
- **Infrastructure**: AWS CDK (TypeScript)
- **Database**: Amazon DynamoDB
- **Logging**: AWS CloudWatch
- **IAM**: Least-privilege access roles
- **Build**: .NET CLI and CDK CLI

## Components and Interfaces

### 1. Infrastructure Layer (CDK)

**CDK Stack (`cdk-construct.ts`)**
- Defines DynamoDB table with appropriate configuration
- Creates Lambda function with .NET 8 runtime
- Sets up IAM roles and policies
- Configures CloudWatch logging
- Manages deployment settings

**Key Configuration:**
- DynamoDB table with on-demand billing
- Lambda timeout: 30 seconds
- Memory: 512 MB (adjustable based on needs)
- Log retention: 7 days

### 2. Lambda Function Layer (.NET)

**Project Structure:**
```
episode-15b/
├── src/
│   └── Episode15b.Lambda/
│       ├── Episode15b.Lambda.csproj
│       ├── Function.cs
│       ├── Models/
│       │   └── DataItem.cs
│       └── Services/
│           └── DynamoDbService.cs
├── cdk-construct.ts
├── cdk-app.ts
└── package.json
```

**Core Components:**

1. **Function.cs** - Main Lambda handler
   - Implements `ILambdaFunction` interface
   - Handles incoming requests
   - Orchestrates DynamoDB operations
   - Returns formatted responses

2. **DynamoDbService.cs** - Data access layer
   - Encapsulates DynamoDB operations
   - Implements async/await patterns
   - Handles error scenarios gracefully
   - Provides typed data access

3. **DataItem.cs** - Data model
   - Represents DynamoDB item structure
   - Includes data annotations for serialization
   - Validates data integrity

### 3. DynamoDB Schema

**Table Configuration:**
- Table Name: `Episode15bData`
- Partition Key: `Id` (String)
- Sort Key: `Timestamp` (String, ISO format)
- Billing Mode: On-demand
- Point-in-time recovery: Enabled

**Sample Item Structure:**
```json
{
  "Id": "item-001",
  "Timestamp": "2025-01-15T10:30:00Z",
  "Name": "Sample Item",
  "Description": "Example data for demonstration",
  "Category": "Demo",
  "IsActive": true
}
```

## Data Models

### Lambda Request/Response Models

**Lambda Input:**
```csharp
public class LambdaRequest
{
    public string? Action { get; set; } = "read";
    public string? ItemId { get; set; }
    public int? Limit { get; set; } = 10;
}
```

**Lambda Response:**
```csharp
public class LambdaResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<DataItem> Items { get; set; } = new();
    public int Count { get; set; }
}
```

### DynamoDB Data Model

**DataItem Entity:**
```csharp
public class DataItem
{
    public string Id { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "General";
    public bool IsActive { get; set; } = true;
}
```

## Error Handling

### Lambda Function Error Handling
1. **Input Validation**: Validate request parameters
2. **DynamoDB Errors**: Handle service exceptions gracefully
3. **Timeout Handling**: Implement proper timeout management
4. **Logging**: Comprehensive error logging with context

### Error Response Format
```csharp
public class ErrorResponse
{
    public bool Success { get; set; } = false;
    public string Error { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
```

### Common Error Scenarios
- DynamoDB table not found
- Access denied (IAM permissions)
- Request timeout
- Invalid input parameters
- Service unavailable

## Testing Strategy

### Unit Testing
- **Framework**: xUnit with Moq
- **Coverage**: Core business logic and data access
- **Mocking**: DynamoDB client operations
- **Test Categories**:
  - Data model validation
  - Service layer operations
  - Error handling scenarios

### Integration Testing
- **Local Testing**: DynamoDB Local for development
- **AWS Testing**: Test against actual AWS services
- **End-to-End**: Full Lambda invocation tests

### Test Structure
```
test/
├── Episode15b.Lambda.Tests/
│   ├── Episode15b.Lambda.Tests.csproj
│   ├── FunctionTests.cs
│   ├── DynamoDbServiceTests.cs
│   └── TestHelpers/
│       └── MockDataHelper.cs
```

## Deployment and Configuration

### CDK Deployment Process
1. Build .NET Lambda project
2. Package Lambda deployment artifact
3. Deploy CDK stack with infrastructure
4. Verify deployment and test functionality

### Environment Configuration
- **Development**: Local DynamoDB, minimal logging
- **Production**: AWS DynamoDB, comprehensive logging
- **Configuration**: Environment variables for table names and settings

### Security Considerations
- Least-privilege IAM roles
- VPC configuration (if required)
- Encryption at rest for DynamoDB
- Secure handling of sensitive data
- Input validation and sanitization

## Performance Considerations

### Lambda Optimization
- Cold start mitigation through proper initialization
- Connection pooling for DynamoDB client
- Efficient memory usage
- Async/await best practices

### DynamoDB Optimization
- Efficient query patterns
- Appropriate read/write capacity
- Index usage optimization
- Batch operations where applicable

## Monitoring and Observability

### CloudWatch Integration
- Lambda execution metrics
- Custom application metrics
- Error rate monitoring
- Performance tracking

### Logging Strategy
- Structured logging with JSON format
- Correlation IDs for request tracking
- Different log levels (Info, Warning, Error)
- Performance timing logs