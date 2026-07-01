using Moq;
using TaskHub.Application.DTOs;
using TaskHub.Application.Enums;
using TaskHub.Application.Exceptions;
using TaskHub.Application.Services;
using TaskHub.Application.Validations;
using TaskHub.Domain.Entities;
using TaskHub.Domain.Interfaces;

namespace TaskHub.Tests.Services;

public class TaskServiceTests
{
    // ── Fixtures ──────────────────────────────────────────────────────────────
    private readonly Mock<ITaskRepository> _repoMock;
    private readonly TaskService _sut;

    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid TaskId = Guid.NewGuid();
    private static readonly Guid WorkCategoryId = Guid.NewGuid();
    private static readonly Guid PersonalCategoryId = Guid.NewGuid();

    public TaskServiceTests()
    {
        _repoMock = new Mock<ITaskRepository>();
        _sut = new TaskService(_repoMock.Object, new CreateTaskDtoValidator(), new UpdateTaskDtoValidator());
    }

    // UpdateTaskDto: (Title, Description, CategoryId, Deadline, IsCompleted)
    private static UpdateTaskDto MakeUpdateDto(
        string title = "Updated",
        string? desc = null,
        Guid? categoryId = null,
        DateTimeOffset? dl = null,
        bool isCompleted = false) =>
        new(title, desc, categoryId, dl, isCompleted);

    private static TaskItem MakeTask(
        string title = "Test Task",
        Guid? categoryId = null,
        bool isCompleted = false,
        string? desc = null,
        DateTimeOffset? deadline = null)
    {
        var t = new TaskItem(title, UserId, desc, categoryId ?? WorkCategoryId, deadline);
        if (isCompleted) t.MarkAsCompleted();
        return t;
    }

    // ── GetAllTasksAsync ──────────────────────────────────────────────────────
    public class GetAllTasksTests : TaskServiceTests
    {
        [Fact]
        public async Task ReturnsCorrectlyMappedResponse()
        {
            var tasks = new List<TaskItem> { MakeTask("Task A"), MakeTask("Task B") };
            _repoMock
                .Setup(r => r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, 8))
                .ReturnsAsync((tasks, 2, 2, 0));

            var result = await _sut.GetAllTasksAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, 8);

            Assert.Equal(2, result.TotalCount);
            Assert.Equal(2, result.PendingCount);
            Assert.Equal(0, result.CompletedCount);
            Assert.Equal(1, result.TotalPages);
            Assert.Equal(2, result.Items.Count);
        }

        [Fact]
        public async Task MapsItemFieldsCorrectly()
        {
            var deadline = DateTimeOffset.UtcNow.AddDays(3);
            var tasks = new List<TaskItem> { MakeTask("My Task", PersonalCategoryId, deadline: deadline) };
            _repoMock
                .Setup(r => r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, 8))
                .ReturnsAsync((tasks, 1, 1, 0));

            var result = await _sut.GetAllTasksAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, 8);
            var item = result.Items[0];

            Assert.Equal("My Task", item.Title);
            Assert.Equal(PersonalCategoryId, item.CategoryId);
            Assert.Equal(deadline, item.Deadline);
            Assert.False(item.IsCompleted);
            Assert.Null(item.CompletedAt);
        }

        [Theory]
        [InlineData(0, 1)]
        [InlineData(-5, 1)]
        [InlineData(3, 3)]
        public async Task ClampsPageNumberBeforePassingToRepo(int raw, int expected)
        {
            _repoMock
                .Setup(r => r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, expected, 8))
                .ReturnsAsync((new List<TaskItem>(), 0, 0, 0));

            await _sut.GetAllTasksAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, raw, 8);

            _repoMock.Verify(r =>
                r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, expected, 8), Times.Once);
        }

        [Theory]
        [InlineData(0, 8)]
        [InlineData(-1, 8)]
        [InlineData(20, 20)]
        public async Task ClampsPageSizeBeforePassingToRepo(int raw, int expected)
        {
            _repoMock
                .Setup(r => r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, expected))
                .ReturnsAsync((new List<TaskItem>(), 0, 0, 0));

            await _sut.GetAllTasksAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, raw);

            _repoMock.Verify(r =>
                r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, expected), Times.Once);
        }

        [Fact]
        public async Task TotalPagesIsZero_WhenNoTasks()
        {
            _repoMock
                .Setup(r => r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, 8))
                .ReturnsAsync((new List<TaskItem>(), 0, 0, 0));

            var result = await _sut.GetAllTasksAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, 8);

            Assert.Equal(0, result.TotalPages);
        }

        [Theory]
        [InlineData(8, 8, 1)]   // exact fit
        [InlineData(9, 8, 2)]   // one overflow item → 2nd page
        [InlineData(25, 8, 4)]   // 3 full + 1 partial
        [InlineData(1, 8, 1)]   // single item
        public async Task TotalPagesCeilsCorrectly(int total, int pageSize, int expectedPages)
        {
            _repoMock
                .Setup(r => r.GetFilteredAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, pageSize))
                .ReturnsAsync((new List<TaskItem>(), total, total, 0));

            var result = await _sut.GetAllTasksAsync(UserId, null, null, TaskSortOption.CreatedAtDesc, 1, pageSize);

            Assert.Equal(expectedPages, result.TotalPages);
        }
    }

    // ── GetTaskByIdAsync ──────────────────────────────────────────────────────
    public class GetTaskByIdTests : TaskServiceTests
    {
        [Fact]
        public async Task ReturnsMappedDto_WhenTaskExists()
        {
            var task = MakeTask("My Task", PersonalCategoryId);
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            var result = await _sut.GetTaskByIdAsync(UserId, task.Id);

            Assert.NotNull(result);
            Assert.Equal(task.Id, result.Id);
            Assert.Equal("My Task", result.Title);
            Assert.Equal(PersonalCategoryId, result.CategoryId);
            Assert.False(result.IsCompleted);
            Assert.Null(result.CompletedAt);
        }

        [Fact]
        public async Task ReturnsNull_WhenTaskNotFound()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            var result = await _sut.GetTaskByIdAsync(UserId, TaskId);

            Assert.Null(result);
        }

        [Fact]
        public async Task DoesNotMutateRepo_OnRead()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await _sut.GetTaskByIdAsync(UserId, TaskId);

            _repoMock.Verify(r => r.AddAsync(It.IsAny<TaskItem>()), Times.Never);
            _repoMock.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
        }
    }

    // ── CreateTaskAsync ───────────────────────────────────────────────────────
    public class CreateTaskTests : TaskServiceTests
    {
        [Fact]
        public async Task AddsTask_AndReturnsMappedDto()
        {
            var dto = new CreateTaskDto("New Task", "Some desc", WorkCategoryId, null);
            TaskItem? captured = null;
            _repoMock
                .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
                .Callback<TaskItem>(t => captured = t)
                .Returns(Task.CompletedTask);
            _repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), UserId))
                .ReturnsAsync(() => captured);

            var result = await _sut.CreateTaskAsync(UserId, dto);

            _repoMock.Verify(r => r.AddAsync(It.IsAny<TaskItem>()), Times.Once);
            Assert.NotNull(captured);
            Assert.Equal("New Task", result.Title);
            Assert.Equal("Some desc", result.Description);
            Assert.Equal(WorkCategoryId, result.CategoryId);
            Assert.Equal(UserId, captured!.UserId);
            Assert.False(result.IsCompleted);
            Assert.Null(result.CompletedAt);
        }

        [Fact]
        public async Task SetsDeadline_WhenProvided()
        {
            var deadline = DateTimeOffset.UtcNow.AddDays(7);
            var dto = new CreateTaskDto("Deadline Task", null, null, deadline);
            TaskItem? captured = null;
            _repoMock
                .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
                .Callback<TaskItem>(t => captured = t)
                .Returns(Task.CompletedTask);
            _repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), UserId))
                .ReturnsAsync(() => captured);

            var result = await _sut.CreateTaskAsync(UserId, dto);

            Assert.Equal(deadline, captured!.Deadline);
            Assert.Equal(deadline, result.Deadline);
        }

        [Fact]
        public async Task DeadlineIsNull_WhenNotProvided()
        {
            var dto = new CreateTaskDto("No Deadline", null, null, null);
            TaskItem? captured = null;
            _repoMock
                .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
                .Callback<TaskItem>(t => captured = t)
                .Returns(Task.CompletedTask);
            _repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), UserId))
                .ReturnsAsync(() => captured);

            var result = await _sut.CreateTaskAsync(UserId, dto);

            Assert.Null(result.Deadline);
        }

        [Fact]
        public async Task AssignsCorrectUserId()
        {
            var dto = new CreateTaskDto("Task", null, null, null);
            TaskItem? captured = null;
            _repoMock
                .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
                .Callback<TaskItem>(t => captured = t)
                .Returns(Task.CompletedTask);
            _repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), UserId))
                .ReturnsAsync(() => captured);

            await _sut.CreateTaskAsync(UserId, dto);

            Assert.Equal(UserId, captured!.UserId);
        }

        [Fact]
        public async Task NewTask_IsNotCompleted()
        {
            var dto = new CreateTaskDto("Task", null, null, null);
            TaskItem? captured = null;
            _repoMock
                .Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
                .Callback<TaskItem>(t => captured = t)
                .Returns(Task.CompletedTask);
            _repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), UserId))
                .ReturnsAsync(() => captured);

            await _sut.CreateTaskAsync(UserId, dto);

            Assert.False(captured!.IsCompleted);
            Assert.Null(captured.CompletedAt);
        }
    }

    // ── UpdateTaskAsync ───────────────────────────────────────────────────────
    public class UpdateTaskTests : TaskServiceTests
    {
        [Fact]
        public async Task CallsUpdateAsync_WhenTaskExists()
        {
            var task = MakeTask();
            var dto = MakeUpdateDto("Updated Title", "New desc", PersonalCategoryId);
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.UpdateTaskAsync(UserId, task.Id, dto);

            _repoMock.Verify(r => r.UpdateAsync(task), Times.Once);
        }

        [Fact]
        public async Task ThrowsNotFoundException_WhenTaskMissing()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.UpdateTaskAsync(UserId, TaskId, MakeUpdateDto()));
        }

        [Fact]
        public async Task DoesNotCallUpdate_WhenTaskMissing()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.UpdateTaskAsync(UserId, TaskId, MakeUpdateDto()));

            _repoMock.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
        }

        [Fact]
        public async Task ExceptionMessage_ContainsTaskId()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.UpdateTaskAsync(UserId, TaskId, MakeUpdateDto()));

            Assert.Contains(TaskId.ToString(), ex.Message);
        }

        [Fact]
        public async Task CompletingTask_SetsCompletedAt()
        {
            var task = MakeTask(isCompleted: false);
            // UpdateTaskDto: (Title, Description, CategoryId, Deadline, IsCompleted)
            var dto = MakeUpdateDto(isCompleted: true);
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.UpdateTaskAsync(UserId, task.Id, dto);

            Assert.True(task.IsCompleted);
            Assert.NotNull(task.CompletedAt);
        }

        [Fact]
        public async Task UncompletingTask_ClearsCompletedAt()
        {
            var task = MakeTask(isCompleted: true);
            var dto = MakeUpdateDto(isCompleted: false);
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.UpdateTaskAsync(UserId, task.Id, dto);

            Assert.False(task.IsCompleted);
            Assert.Null(task.CompletedAt);
        }
    }

    // ── MarkAsCompleteAsync ───────────────────────────────────────────────────
    public class MarkAsCompleteTests : TaskServiceTests
    {
        [Fact]
        public async Task SetsIsCompletedAndCompletedAt()
        {
            var task = MakeTask(isCompleted: false);
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.MarkAsCompleteAsync(UserId, task.Id);

            Assert.True(task.IsCompleted);
            Assert.NotNull(task.CompletedAt);
        }

        [Fact]
        public async Task CallsUpdateAsync_WhenTaskExists()
        {
            var task = MakeTask();
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.MarkAsCompleteAsync(UserId, task.Id);

            _repoMock.Verify(r => r.UpdateAsync(task), Times.Once);
        }

        [Fact]
        public async Task ThrowsNotFoundException_WhenTaskMissing()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.MarkAsCompleteAsync(UserId, TaskId));
        }

        [Fact]
        public async Task DoesNotCallUpdate_WhenTaskMissing()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.MarkAsCompleteAsync(UserId, TaskId));

            _repoMock.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
        }

        [Fact]
        public async Task CompletedAt_IsSetToApproximatelyUtcNow()
        {
            var task = MakeTask(isCompleted: false);
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
            var before = DateTimeOffset.UtcNow;

            await _sut.MarkAsCompleteAsync(UserId, task.Id);

            Assert.True(task.CompletedAt >= before);
            Assert.True(task.CompletedAt <= DateTimeOffset.UtcNow);
        }
    }

    // ── DeleteTaskAsync ───────────────────────────────────────────────────────
    public class DeleteTaskTests : TaskServiceTests
    {
        [Fact]
        public async Task SetsDeletedAt_SoftDelete()
        {
            var task = MakeTask();
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.DeleteTaskAsync(UserId, task.Id);

            Assert.NotNull(task.DeletedAt);
        }

        [Fact]
        public async Task CallsUpdateAsync_WhenTaskExists()
        {
            var task = MakeTask();
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);

            await _sut.DeleteTaskAsync(UserId, task.Id);

            _repoMock.Verify(r => r.UpdateAsync(task), Times.Once);
        }


        [Fact]
        public async Task ThrowsNotFoundException_WhenTaskMissing()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.DeleteTaskAsync(UserId, TaskId));
        }

        [Fact]
        public async Task DoesNotCallUpdate_WhenTaskMissing()
        {
            _repoMock.Setup(r => r.GetByIdAsync(TaskId, UserId)).ReturnsAsync((TaskItem?)null);

            await Assert.ThrowsAsync<NotFoundException>(() =>
                _sut.DeleteTaskAsync(UserId, TaskId));

            _repoMock.Verify(r => r.UpdateAsync(It.IsAny<TaskItem>()), Times.Never);
        }

        [Fact]
        public async Task DeletedAt_IsSetToApproximatelyUtcNow()
        {
            var task = MakeTask();
            _repoMock.Setup(r => r.GetByIdAsync(task.Id, UserId)).ReturnsAsync(task);
            var before = DateTimeOffset.UtcNow;

            await _sut.DeleteTaskAsync(UserId, task.Id);

            Assert.True(task.DeletedAt >= before);
            Assert.True(task.DeletedAt <= DateTimeOffset.UtcNow);
        }
    }
}
